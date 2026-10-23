const express = require('express');
const requireAuth = require('../middleware/auth');
const { orders, orderItems, foodItems, foodWaste, ingredients } = require('../store');
const { getSalesAnalytics } = require('../analytics');

const router = express.Router();

router.get('/summary', requireAuth, (req, res) => {
  const sales = getSalesAnalytics(orders, orderItems, foodItems, req.query.days);
  const lowStock = ingredients.filter((item) => Number(item.quantity) <= Number(item.minimum_threshold));
  const wasteImpact = foodWaste.reduce((sum, item) => sum + Number(item.estimated_loss || 0), 0);

  return res.json({
    totalRevenue: sales.totalRevenue,
    totalOrders: sales.totalOrders,
    paidOrders: sales.paidOrders,
    averageOrderValue: sales.averageOrderValue,
    lowStockCount: lowStock.length,
    dailySales: sales.dailySales,
    bestSelling: { items: sales.bestSelling },
    wasteImpact,
  });
});

router.get('/export', requireAuth, (req, res) => {
  const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = [
    ['Date', 'Order ID', 'Customer', 'Total', 'Payment Status', 'Order Status'],
    ...orders.map((order) => [
      order.order_date,
      order.id,
      order.customer_name,
      order.total_amount,
      order.payment_status,
      order.order_status,
    ]),
  ];

  const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="foodnest_sales_report.csv"');
  return res.send(csv);
});

module.exports = router;
