const express = require('express');
const requireAuth = require('../middleware/auth');
const { foodWaste } = require('../store');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const summary = foodWaste.reduce((acc, entry) => {
    acc.totalWaste += Number(entry.quantity || 0);
    acc.totalLoss += Number(entry.estimated_loss || 0);
    return acc;
  }, { totalWaste: 0, totalLoss: 0 });

  return res.json({ waste: foodWaste, summary });
});

router.post('/', requireAuth, (req, res) => {
  const { ingredient_name, quantity, reason, estimated_loss } = req.body;
  const parsedQuantity = Number(quantity);
  const parsedLoss = Number(estimated_loss || 0);

  if (
    !String(ingredient_name || '').trim() ||
    !Number.isFinite(parsedQuantity) ||
    parsedQuantity <= 0 ||
    !String(reason || '').trim() ||
    !Number.isFinite(parsedLoss) ||
    parsedLoss < 0
  ) {
    return res.status(400).json({ message: 'Ingredient name, quantity, and reason are required.' });
  }

  const nextId = foodWaste.length ? Math.max(...foodWaste.map((item) => item.id)) + 1 : 1;
  const entry = {
    id: nextId,
    ingredient_name: String(ingredient_name).trim(),
    quantity: parsedQuantity,
    reason: String(reason).trim(),
    waste_date: new Date().toISOString(),
    estimated_loss: parsedLoss,
  };

  foodWaste.push(entry);
  return res.status(201).json({ entry, message: 'Waste record created.' });
});

module.exports = router;
