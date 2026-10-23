const express = require('express');
const requireAuth = require('../middleware/auth');
const { orders, orderItems, foodItems, ingredients, foodWaste, activityLogs } = require('../store');
const { getSalesAnalytics } = require('../analytics');

const router = express.Router();

router.get('/summary', requireAuth, (req, res) => {
  const sales = getSalesAnalytics(orders, orderItems, foodItems, req.query.days);
  const activeMenuItems = foodItems.filter((item) => item.available).length;
  const lowStockIngredients = ingredients.filter((item) => Number(item.quantity) <= Number(item.minimum_threshold)).length;
  const wasteCost = foodWaste.reduce((sum, item) => sum + Number(item.estimated_loss || 0), 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
    .slice(0, 5)
    .map((order) => ({
      id: order.id,
      customer: order.customer_name,
      items: order.items,
      amount: order.total_amount,
      status: order.order_status,
      payment: order.payment_status,
      date: order.order_date,
    }));

  const lowStockAlerts = ingredients
    .filter((item) => Number(item.quantity) <= Number(item.minimum_threshold))
    .map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      threshold: item.minimum_threshold,
    }));

  const expiringIngredients = ingredients
    .filter((item) => new Date(item.expiry_date) < new Date(Date.now() + 1000 * 60 * 60 * 24 * 7))
    .map((item) => ({
      id: item.id,
      name: item.name,
      expiry: item.expiry_date,
      quantity: item.quantity,
      unit: item.unit,
    }));

  const recentActivity = [...activityLogs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
    .map((log) => ({
      id: log.id,
      action: log.action,
      actor: log.actor,
      time: log.created_at,
    }));

  return res.json({
    totalOrders: sales.totalOrders,
    paidOrders: sales.paidOrders,
    revenue: sales.totalRevenue,
    averageOrderValue: sales.averageOrderValue,
    activeMenuItems,
    lowStockIngredients,
    wasteCost,
    weeklySales: sales.dailySales,
    popularFoods: sales.bestSelling,
    recentOrders,
    lowStockAlerts,
    expiringIngredients,
    recentActivity,
  });
});

module.exports = router;
