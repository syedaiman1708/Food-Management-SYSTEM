const bcrypt = require('bcryptjs');

const categories = [
  { id: 1, name: 'Breakfast' },
  { id: 2, name: 'Main Course' },
  { id: 3, name: 'Snacks' },
  { id: 4, name: 'Beverages' },
  { id: 5, name: 'Desserts' },
];

const suppliers = [
  { id: 1, name: 'Fresh Valley Farms', contact: 'support@freshvalley.in', city: 'Pune' },
  { id: 2, name: 'Green Harvest Co.', contact: 'hi@greenharvest.in', city: 'Mumbai' },
  { id: 3, name: 'Daily Dairy Supplies', contact: 'sales@dailydairy.in', city: 'Nashik' },
];

const users = [
  {
    id: 1,
    fullName: 'Admin User',
    username: 'admin',
    email: 'admin@foodnest.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
  },
  {
    id: 2,
    fullName: 'Kitchen Staff',
    username: 'staff',
    email: 'staff@foodnest.com',
    passwordHash: bcrypt.hashSync('staff123', 10),
    role: 'staff',
  },
];

const customers = [
  { id: 1, name: 'Siddharth Rao', phone: '+91 98765 43210', email: 'sid@example.com', totalOrders: 4, totalSpent: 2140.00 },
  { id: 2, name: 'Aisha Khan', phone: '+91 91234 56789', email: 'aisha@example.com', totalOrders: 3, totalSpent: 1980.00 },
  { id: 3, name: 'Vikram Nair', phone: '+91 99887 66554', email: 'vikram@example.com', totalOrders: 2, totalSpent: 1225.00 },
  { id: 4, name: 'Meera Shah', phone: '+91 97654 32109', email: 'meera@example.com', totalOrders: 5, totalSpent: 2899.00 },
  { id: 5, name: 'Arjun Desai', phone: '+91 98123 45670', email: 'arjun.desai@example.com', totalOrders: 0, totalSpent: 0 },
  { id: 6, name: 'Priya Menon', phone: '+91 98234 56701', email: 'priya.menon@example.com', totalOrders: 0, totalSpent: 0 },
  { id: 7, name: 'Kabir Mehta', phone: '+91 98345 67812', email: 'kabir.mehta@example.com', totalOrders: 0, totalSpent: 0 },
  { id: 8, name: 'Diya Patel', phone: '+91 98456 78923', email: 'diya.patel@example.com', totalOrders: 0, totalSpent: 0 },
  { id: 9, name: 'Rohan Iyer', phone: '+91 98567 89034', email: 'rohan.iyer@example.com', totalOrders: 0, totalSpent: 0 },
  { id: 10, name: 'Ananya Bose', phone: '+91 98678 90145', email: 'ananya.bose@example.com', totalOrders: 0, totalSpent: 0 },
];

const foodItems = [
  { id: 1, name: 'Avocado Breakfast Bowl', category_id: 1, description: 'Farm-fresh avocado, quinoa, greens, and seeds.', price: 240.00, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80', available: true },
  { id: 2, name: 'Crispy Paneer Wrap', category_id: 1, description: 'Paneer crunch with herb mayo and lettuce wrap.', price: 210.00, image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80', available: true },
  { id: 3, name: 'Grilled Herb Chicken', category_id: 2, description: 'Lean protein with roasted vegetables and lemon butter.', price: 420.00, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80', available: true },
  { id: 4, name: 'Garden Veggie Pasta', category_id: 2, description: 'Fresh salad pasta with basil pesto and parmesan.', price: 380.00, image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=900&q=80', available: true },
  { id: 5, name: 'Loaded Nachos', category_id: 3, description: 'Crispy tortilla chips with beans, cheese, and salsa.', price: 260.00, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=900&q=80', available: true },
  { id: 6, name: 'Iced Lime Cooler', category_id: 4, description: 'Refreshing citrus blend with mint and sparkling water.', price: 120.00, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80', available: true },
  { id: 7, name: 'Dark Chocolate Mousse', category_id: 5, description: 'Silky mousse topped with cocoa nibs and berries.', price: 180.00, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80', available: true },
  { id: 8, name: 'Saffron Rice Bowl', category_id: 2, description: 'Aromatic saffron rice with roasted peppers and curd.', price: 295.00, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80', available: false },
];

const ingredients = [
  { id: 1, name: 'Tomatoes', category: 'Vegetables', quantity: 34, unit: 'kg', minimum_threshold: 12, supplier_id: 1, expiry_date: '2026-10-23', status: 'Normal' },
  { id: 2, name: 'Spinach', category: 'Leafy Greens', quantity: 8, unit: 'kg', minimum_threshold: 12, supplier_id: 1, expiry_date: '2026-10-18', status: 'Low Stock' },
  { id: 3, name: 'Chicken Breast', category: 'Protein', quantity: 16, unit: 'kg', minimum_threshold: 10, supplier_id: 2, expiry_date: '2026-10-21', status: 'Normal' },
  { id: 4, name: 'Milk', category: 'Dairy', quantity: 9, unit: 'litres', minimum_threshold: 10, supplier_id: 3, expiry_date: '2026-10-16', status: 'Low Stock' },
  { id: 5, name: 'Paneer', category: 'Dairy', quantity: 7, unit: 'kg', minimum_threshold: 8, supplier_id: 3, expiry_date: '2026-10-17', status: 'Critical' },
  { id: 6, name: 'Cucumber', category: 'Vegetables', quantity: 18, unit: 'kg', minimum_threshold: 8, supplier_id: 1, expiry_date: '2026-10-30', status: 'Normal' },
];

const stockTransactions = [
  { id: 1, ingredient_id: 1, type: 'purchase', quantity: 22, unit_price: 35.00, updated_at: '2026-10-10T09:00:00.000Z' },
  { id: 2, ingredient_id: 2, type: 'usage', quantity: 5, unit_price: 28.00, updated_at: '2026-10-11T13:30:00.000Z' },
  { id: 3, ingredient_id: 3, type: 'purchase', quantity: 12, unit_price: 175.00, updated_at: '2026-10-12T11:15:00.000Z' },
];

const orders = [
  { id: 1, customer_id: 1, customer_name: 'Siddharth Rao', total_amount: 900.00, payment_status: 'Paid', order_status: 'Completed', order_date: '2026-10-12T18:40:00.000Z', items: 'Avocado Breakfast Bowl x 2, Grilled Herb Chicken x 1' },
  { id: 2, customer_id: 2, customer_name: 'Aisha Khan', total_amount: 450.00, payment_status: 'Paid', order_status: 'Preparing', order_date: '2026-10-13T12:25:00.000Z', items: 'Crispy Paneer Wrap x 1, Iced Lime Cooler x 2' },
  { id: 3, customer_id: 3, customer_name: 'Vikram Nair', total_amount: 380.00, payment_status: 'Pending', order_status: 'Pending', order_date: '2026-10-14T09:20:00.000Z', items: 'Garden Veggie Pasta x 1' },
  { id: 4, customer_id: 4, customer_name: 'Meera Shah', total_amount: 1100.00, payment_status: 'Paid', order_status: 'Ready', order_date: '2026-10-14T14:05:00.000Z', items: 'Grilled Herb Chicken x 2, Loaded Nachos x 1' },
];

const orderItems = [
  { id: 1, order_id: 1, food_item_id: 1, quantity: 2, unit_price: 240.00 },
  { id: 2, order_id: 1, food_item_id: 3, quantity: 1, unit_price: 420.00 },
  { id: 3, order_id: 2, food_item_id: 2, quantity: 1, unit_price: 210.00 },
  { id: 4, order_id: 2, food_item_id: 6, quantity: 2, unit_price: 120.00 },
  { id: 5, order_id: 3, food_item_id: 4, quantity: 1, unit_price: 380.00 },
  { id: 6, order_id: 4, food_item_id: 3, quantity: 2, unit_price: 420.00 },
  { id: 7, order_id: 4, food_item_id: 5, quantity: 1, unit_price: 260.00 },
];

const foodWaste = [
  { id: 1, ingredient_name: 'Spinach', quantity: 2.5, reason: 'Overstock on leafy greens', waste_date: '2026-10-11T08:00:00.000Z', estimated_loss: 95.00 },
  { id: 2, ingredient_name: 'Milk', quantity: 1.4, reason: 'Expiry near threshold', waste_date: '2026-10-12T11:30:00.000Z', estimated_loss: 72.00 },
  { id: 3, ingredient_name: 'Paneer', quantity: 1.0, reason: 'Storage temperature issue', waste_date: '2026-10-14T07:45:00.000Z', estimated_loss: 120.00 },
];

const activityLogs = [
  { id: 1, action: 'Menu updated', actor: 'admin', created_at: '2026-10-13T09:10:00.000Z' },
  { id: 2, action: 'Stock restocked', actor: 'staff', created_at: '2026-10-13T13:40:00.000Z' },
  { id: 3, action: 'Waste report generated', actor: 'admin', created_at: '2026-10-14T16:25:00.000Z' },
];

module.exports = {
  categories,
  customers,
  foodItems,
  ingredients,
  suppliers,
  users,
  orders,
  orderItems,
  stockTransactions,
  foodWaste,
  activityLogs,
};
