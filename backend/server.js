const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const { initDatabase, getDbMode } = require('./db');
const requireAuth = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const customerRoutes = require('./routes/customers');
const wasteRoutes = require('./routes/waste');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'foodnest-demo-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, mode: getDbMode(), service: 'FoodNest API' });
});

app.get('/api/admin-check', requireAuth, (req, res) => {
  res.json({ ok: true, role: req.session.user.role });
});

const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

const pageMap = {
  '/': 'index.html',
  '/login': 'login.html',
  '/register': 'register.html',
  '/order': 'order.html',
  '/dashboard': 'dashboard.html',
  '/menu': 'menu.html',
  '/orders': 'orders.html',
  '/inventory': 'inventory.html',
  '/customers': 'customers.html',
  '/waste': 'waste.html',
  '/reports': 'reports.html',
  '/settings': 'settings.html',
};

Object.entries(pageMap).forEach(([route, fileName]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(frontendDir, fileName));
  });
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found.' });
  }

  return res.status(404).sendFile(path.join(frontendDir, 'index.html'));
});

async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`FoodNest server is running on http://localhost:${PORT}`);
    console.log('Use demo login: admin / admin123');
  });
}

startServer();
