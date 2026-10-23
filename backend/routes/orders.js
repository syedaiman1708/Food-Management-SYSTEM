const express = require('express');
const requireAuth = require('../middleware/auth');
const { orders, orderItems, foodItems, customers } = require('../store');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const { status } = req.query;
  const list = [...orders].filter((order) => !status || status === 'all' || order.order_status === status);

  return res.json({
    orders: list.map((order) => ({
      ...order,
      customer: customers.find((customer) => customer.id === order.customer_id),
      items: orderItems
        .filter((entry) => entry.order_id === order.id)
        .map((entry) => ({
          ...entry,
          name: foodItems.find((foodItem) => foodItem.id === entry.food_item_id)?.name || 'Menu item',
        })),
    })),
  });
});

router.post('/', requireAuth, (req, res) => {
  const { customerId, items, payment_status } = req.body;

  if (!customerId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Customer and at least one menu item are required.' });
  }

  const customer = customers.find((entry) => entry.id === Number(customerId));
  if (!customer) {
    return res.status(400).json({ message: 'Select a valid customer.' });
  }

  const normalizedItems = [];
  for (const item of items) {
    const menuItem = foodItems.find((entry) => entry.id === Number(item.food_item_id) && entry.available);
    const quantity = Number(item.quantity);
    if (!menuItem || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Choose available menu items with a quantity of at least one.' });
    }
    normalizedItems.push({ food_item_id: menuItem.id, quantity, menuItem });
  }

  const allowedPayments = ['Pending', 'Paid'];
  if (payment_status !== undefined && !allowedPayments.includes(payment_status)) {
    return res.status(400).json({ message: 'Payment status must be Pending or Paid.' });
  }

  const orderTotal = normalizedItems.reduce((sum, item) => sum + Number(item.menuItem.price) * item.quantity, 0);

  const nextOrderId = orders.length ? Math.max(...orders.map((order) => order.id)) + 1 : 1;

  const order = {
    id: nextOrderId,
    customer_id: Number(customerId),
    customer_name: customer ? customer.name : 'Walk-in Guest',
    total_amount: Number(orderTotal.toFixed(2)),
    payment_status: payment_status || 'Pending',
    order_status: 'Pending',
    order_date: new Date().toISOString(),
    items: normalizedItems.map((item) => `${item.menuItem.name} x ${item.quantity}`).join(', '),
  };

  orders.push(order);

  normalizedItems.forEach((item, idx) => {
    orderItems.push({
      id: Date.now() + idx,
      order_id: order.id,
      food_item_id: item.food_item_id,
      quantity: item.quantity,
      unit_price: Number(item.menuItem.price),
    });
  });

  return res.status(201).json({ order, message: 'Order created successfully.' });
});

router.patch('/:id/status', requireAuth, (req, res) => {
  const { status } = req.body;
  const order = orders.find((entry) => entry.id === Number(req.params.id));

  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  const allowedStatuses = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Choose a valid order status.' });
  }

  order.order_status = status;
  return res.json({ order, message: 'Order status updated.' });
});

module.exports = router;
