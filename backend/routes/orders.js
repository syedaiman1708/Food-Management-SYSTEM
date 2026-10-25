const express = require('express');
const requireAuth = require('../middleware/auth');
const { saveOrderData } = require('../order-storage');
const { orders, orderItems, foodItems, customers } = require('../store');

const router = express.Router();

function saveOrder(customer, normalizedItems, paymentStatus = 'Pending') {
  const orderTotal = normalizedItems.reduce((sum, item) => sum + Number(item.menuItem.price) * item.quantity, 0);
  const nextOrderId = orders.length ? Math.max(...orders.map((order) => order.id)) + 1 : 1;
  const order = {
    id: nextOrderId,
    customer_id: customer.id,
    customer_name: customer.name,
    total_amount: Number(orderTotal.toFixed(2)),
    payment_status: paymentStatus,
    order_status: 'Pending',
    order_date: new Date().toISOString(),
    items: normalizedItems.map((item) => `${item.menuItem.name} x ${item.quantity}`).join(', '),
  };

  const newOrderItems = normalizedItems.map((item, idx) => ({
    id: Date.now() + idx,
    order_id: order.id,
    food_item_id: item.food_item_id,
    quantity: item.quantity,
    unit_price: Number(item.menuItem.price),
  }));

  saveOrderData({
    orders: [...orders, order],
    orderItems: [...orderItems, ...newOrderItems],
    customers: customers.some((entry) => entry.id === customer.id) ? customers : [...customers, customer],
  });

  orders.push(order);
  orderItems.push(...newOrderItems);

  return order;
}

function normalizeItems(items) {
  const normalizedItems = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const menuItem = foodItems.find((entry) => entry.id === Number(item.food_item_id) && entry.available);
    const quantity = Number(item.quantity);
    if (!menuItem || !Number.isInteger(quantity) || quantity < 1) {
      return null;
    }
    normalizedItems.push({ food_item_id: menuItem.id, quantity, menuItem });
  }

  return normalizedItems;
}

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

router.post('/public', (req, res) => {
  const name = String(req.body.name || '').trim();
  const phone = String(req.body.phone || '');
  const { items } = req.body;

  if (!name || name.length > 120 || !/^\d{10}$/.test(phone) || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Enter your name, a 10-digit mobile number, and at least one menu item.' });
  }

  const normalizedItems = normalizeItems(items);
  if (!normalizedItems) {
    return res.status(400).json({ message: 'Choose available menu items with a quantity of at least one.' });
  }

  const customer = customers.find((entry) => String(entry.phone || '').replace(/\D/g, '').slice(-10) === phone)
    || {
      id: customers.length ? Math.max(...customers.map((entry) => entry.id)) + 1 : 1,
      name,
      phone,
      email: '',
      totalOrders: 0,
      totalSpent: 0,
    };

  const isNewCustomer = !customers.includes(customer);
  if (isNewCustomer) customers.push(customer);

  try {
    const order = saveOrder({ ...customer, name }, normalizedItems);
    return res.status(201).json({ order, message: 'Your order has been placed.' });
  } catch (error) {
    if (isNewCustomer) customers.pop();
    return res.status(500).json({ message: 'Could not save your order. Please try again.' });
  }
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

  const normalizedItems = normalizeItems(items);
  if (!normalizedItems) {
    return res.status(400).json({ message: 'Choose available menu items with a quantity of at least one.' });
  }

  const allowedPayments = ['Pending', 'Paid'];
  if (payment_status !== undefined && !allowedPayments.includes(payment_status)) {
    return res.status(400).json({ message: 'Payment status must be Pending or Paid.' });
  }

  try {
    const order = saveOrder(customer, normalizedItems, payment_status || 'Pending');
    return res.status(201).json({ order, message: 'Order created successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not save the food order. Please try again.' });
  }
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

  const previousStatus = order.order_status;
  order.order_status = status;
  try {
    saveOrderData({ orders, orderItems, customers });
  } catch (error) {
    order.order_status = previousStatus;
    return res.status(500).json({ message: 'Could not save the order status. Please try again.' });
  }

  return res.json({ order, message: 'Order status updated.' });
});

module.exports = router;
