const express = require('express');
const requireAuth = require('../middleware/auth');
const { ingredients, stockTransactions } = require('../store');

const router = express.Router();

function determineStatus(quantity, minimumThreshold) {
  if (quantity <= minimumThreshold) return 'Low Stock';
  if (quantity <= minimumThreshold * 1.5) return 'Watch';
  return 'Normal';
}

router.get('/', requireAuth, (req, res) => {
  const { search = '' } = req.query;
  const query = String(search).trim().toLowerCase();

  const list = ingredients
    .filter((item) => !query || item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query))
    .map((item) => ({
      ...item,
      status: determineStatus(Number(item.quantity), Number(item.minimum_threshold)),
      expiry_warning: new Date(item.expiry_date) < new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    }));

  return res.json({ ingredients: list });
});

router.post('/', requireAuth, (req, res) => {
  const { name, category, quantity, unit, minimum_threshold, supplier_id, expiry_date } = req.body;

  if (
    !String(name || '').trim() ||
    !String(category || '').trim() ||
    !Number.isFinite(Number(quantity)) ||
    Number(quantity) < 0 ||
    !String(unit || '').trim() ||
    !Number.isFinite(Number(minimum_threshold)) ||
    Number(minimum_threshold) < 0 ||
    !Number.isInteger(Number(supplier_id)) ||
    Number(supplier_id) < 1
  ) {
    return res.status(400).json({ message: 'Ingredient details are incomplete.' });
  }

  const nextId = ingredients.length ? Math.max(...ingredients.map((item) => item.id)) + 1 : 1;
  const item = {
    id: nextId,
    name: String(name).trim(),
    category: String(category).trim(),
    quantity: Number(quantity),
    unit: String(unit).trim(),
    minimum_threshold: Number(minimum_threshold),
    supplier_id: Number(supplier_id),
    expiry_date: expiry_date || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    status: determineStatus(Number(quantity), Number(minimum_threshold)),
  };

  ingredients.push(item);
  stockTransactions.push({
    id: Date.now(),
    ingredient_id: item.id,
    type: 'purchase',
    quantity: Number(quantity),
    unit_price: 0,
    updated_at: new Date().toISOString(),
  });

  return res.status(201).json({ ingredient: item, message: 'Ingredient added.' });
});

router.patch('/:id', requireAuth, (req, res) => {
  const ingredient = ingredients.find((item) => item.id === Number(req.params.id));

  if (!ingredient) {
    return res.status(404).json({ message: 'Ingredient not found.' });
  }

  Object.assign(ingredient, req.body, {
    quantity: Number(req.body.quantity ?? ingredient.quantity),
    minimum_threshold: Number(req.body.minimum_threshold ?? ingredient.minimum_threshold),
  });

  ingredient.status = determineStatus(Number(ingredient.quantity), Number(ingredient.minimum_threshold));
  return res.json({ ingredient, message: 'Ingredient updated.' });
});

router.patch('/:id/restock', requireAuth, (req, res) => {
  const ingredient = ingredients.find((item) => item.id === Number(req.params.id));

  if (!ingredient) {
    return res.status(404).json({ message: 'Ingredient not found.' });
  }

  const quantity = Number(req.body.quantity || 0);
  if (quantity <= 0) {
    return res.status(400).json({ message: 'Quantity must be greater than zero.' });
  }

  ingredient.quantity += quantity;
  ingredient.status = determineStatus(Number(ingredient.quantity), Number(ingredient.minimum_threshold));
  stockTransactions.push({
    id: Date.now(),
    ingredient_id: ingredient.id,
    type: 'purchase',
    quantity,
    unit_price: Number(req.body.unit_price || 0),
    updated_at: new Date().toISOString(),
  });

  return res.json({ ingredient, message: 'Stock updated successfully.' });
});

module.exports = router;
