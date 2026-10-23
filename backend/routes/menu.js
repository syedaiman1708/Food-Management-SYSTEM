const express = require('express');
const requireAuth = require('../middleware/auth');
const { categories, foodItems } = require('../store');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const menu = foodItems.map((item) => ({
    ...item,
    category: categories.find((cat) => cat.id === item.category_id)?.name || 'General',
  }));

  return res.json({ categories, items: menu });
});

router.post('/', requireAuth, (req, res) => {
  const { name, category_id, description, price, image, available } = req.body;
  const category = categories.find((entry) => entry.id === Number(category_id));

  if (!String(name || '').trim() || !category || !String(description || '').trim() || !Number.isFinite(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ message: 'Name, category, description, and price are required.' });
  }

  const nextId = foodItems.length ? Math.max(...foodItems.map((item) => item.id)) + 1 : 1;
  const item = {
    id: nextId,
    name: String(name).trim(),
    category_id: Number(category_id),
    description: String(description).trim(),
    price: Number(price),
    image: image || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
    available: available !== undefined ? Boolean(available) : true,
  };

  foodItems.push(item);
  return res.status(201).json({ item, message: 'Food item added.' });
});

router.put('/:id', requireAuth, (req, res) => {
  const itemIndex = foodItems.findIndex((item) => item.id === Number(req.params.id));

  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Food item not found.' });
  }

  const item = foodItems[itemIndex];
  const categoryId = Number(req.body.category_id ?? item.category_id);
  const price = Number(req.body.price ?? item.price);
  if (
    (req.body.name !== undefined && !String(req.body.name).trim()) ||
    (req.body.description !== undefined && !String(req.body.description).trim()) ||
    !categories.some((category) => category.id === categoryId) ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return res.status(400).json({ message: 'Provide a valid name, category, description, and price.' });
  }

  const nextItem = {
    ...item,
    ...req.body,
    id: item.id,
    name: String(req.body.name ?? item.name).trim(),
    description: String(req.body.description ?? item.description).trim(),
    price,
    category_id: categoryId,
    available: req.body.available !== undefined ? Boolean(req.body.available) : item.available,
  };

  foodItems[itemIndex] = nextItem;
  return res.json({ item: nextItem, message: 'Food item updated.' });
});

router.delete('/:id', requireAuth, (req, res) => {
  const index = foodItems.findIndex((item) => item.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: 'Food item not found.' });
  }

  const [removed] = foodItems.splice(index, 1);
  return res.json({ item: removed, message: 'Food item deleted.' });
});

module.exports = router;
