const express = require('express');
const requireAuth = require('../middleware/auth');
const { customers, orders } = require('../store');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const customerList = customers.map((customer) => {
    const customerOrders = orders.filter((order) => order.customer_id === customer.id);
    return {
      ...customer,
      totalOrders: customerOrders.length,
      totalSpent: customerOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
    };
  });

  return res.json({ customers: customerList });
});

router.post('/', requireAuth, (req, res) => {
  const { name, email, phone } = req.body;
  const normalizedPhone = String(phone || '').replace(/\D/g, '');

  if (!name || !email || !/^\d{10}$/.test(normalizedPhone)) {
    return res.status(400).json({ message: 'Customer name, email, and a 10-digit mobile number are required.' });
  }

  const nextId = customers.length ? Math.max(...customers.map((customer) => customer.id)) + 1 : 1;
  const customer = {
    id: nextId,
    name: String(name).trim(),
    email: String(email).trim(),
    phone: normalizedPhone,
    totalOrders: 0,
    totalSpent: 0,
  };

  customers.push(customer);
  return res.status(201).json({ customer, message: 'Customer created.' });
});

module.exports = router;
