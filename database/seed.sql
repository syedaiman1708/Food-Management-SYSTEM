USE foodnest_db;

INSERT INTO users (full_name, username, email, password_hash, role) VALUES
  ('Admin User', 'admin', 'admin@foodnest.com', '$2a$10$N6dEwCoXlr2I4Xuu3C9gAOcJ8rdUOk2OzhcE7q0jJQfZ6wXNwV2Ue', 'admin'),
  ('Kitchen Staff', 'staff', 'staff@foodnest.com', '$2a$10$4Yb2u9jWfrL8b9cN4zx1D.wYl3Aq6hLh6yAZH9Em6IQwP0Qxm7d26', 'staff');

INSERT INTO categories (name) VALUES
  ('Breakfast'),
  ('Main Course'),
  ('Snacks'),
  ('Beverages'),
  ('Desserts');

INSERT INTO suppliers (name, contact_email, city) VALUES
  ('Fresh Valley Farms', 'support@freshvalley.in', 'Pune'),
  ('Green Harvest Co.', 'hi@greenharvest.in', 'Mumbai'),
  ('Daily Dairy Supplies', 'sales@dailydairy.in', 'Nashik');

INSERT INTO food_items (name, category_id, description, price, image_url, available) VALUES
  ('Avocado Breakfast Bowl', 1, 'Farm-fresh avocado, quinoa, greens, and seeds.', 240.00, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80', TRUE),
  ('Crispy Paneer Wrap', 1, 'Paneer crunch with herb mayo and lettuce wrap.', 210.00, 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80', TRUE),
  ('Grilled Herb Chicken', 2, 'Lean protein with roasted vegetables and lemon butter.', 420.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80', TRUE),
  ('Garden Veggie Pasta', 2, 'Fresh salad pasta with basil pesto and parmesan.', 380.00, 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=900&q=80', TRUE),
  ('Loaded Nachos', 3, 'Crispy tortilla chips with beans, cheese, and salsa.', 260.00, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=900&q=80', TRUE),
  ('Iced Lime Cooler', 4, 'Refreshing citrus blend with mint and sparkling water.', 120.00, 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80', TRUE),
  ('Dark Chocolate Mousse', 5, 'Silky mousse topped with cocoa nibs and berries.', 180.00, 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80', TRUE),
  ('Saffron Rice Bowl', 2, 'Aromatic saffron rice with roasted peppers and curd.', 295.00, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80', FALSE);

INSERT INTO customers (name, phone, email) VALUES
  ('Siddharth Rao', '+91 98765 43210', 'sid@example.com'),
  ('Aisha Khan', '+91 91234 56789', 'aisha@example.com'),
  ('Vikram Nair', '+91 99887 66554', 'vikram@example.com'),
  ('Meera Shah', '+91 97654 32109', 'meera@example.com'),
  ('Arjun Desai', '+91 98123 45670', 'arjun.desai@example.com'),
  ('Priya Menon', '+91 98234 56701', 'priya.menon@example.com'),
  ('Kabir Mehta', '+91 98345 67812', 'kabir.mehta@example.com'),
  ('Diya Patel', '+91 98456 78923', 'diya.patel@example.com'),
  ('Rohan Iyer', '+91 98567 89034', 'rohan.iyer@example.com'),
  ('Ananya Bose', '+91 98678 90145', 'ananya.bose@example.com');

INSERT INTO orders (customer_id, customer_name, total_amount, payment_status, order_status, order_date) VALUES
  (1, 'Siddharth Rao', 900.00, 'Paid', 'Completed', '2026-10-12 18:40:00'),
  (2, 'Aisha Khan', 450.00, 'Paid', 'Preparing', '2026-10-13 12:25:00'),
  (3, 'Vikram Nair', 380.00, 'Pending', 'Pending', '2026-10-14 09:20:00'),
  (4, 'Meera Shah', 1100.00, 'Paid', 'Ready', '2026-10-14 14:05:00');

INSERT INTO order_items (order_id, food_item_id, quantity, unit_price) VALUES
  (1, 1, 2, 240.00),
  (1, 3, 1, 420.00),
  (2, 2, 1, 210.00),
  (2, 6, 2, 120.00),
  (3, 4, 1, 380.00),
  (4, 3, 2, 420.00),
  (4, 5, 1, 260.00);

INSERT INTO ingredients (name, category, quantity, unit, minimum_threshold, supplier_id, expiry_date, status) VALUES
  ('Tomatoes', 'Vegetables', 34, 'kg', 12, 1, '2026-10-23', 'Normal'),
  ('Spinach', 'Leafy Greens', 8, 'kg', 12, 1, '2026-10-18', 'Low Stock'),
  ('Chicken Breast', 'Protein', 16, 'kg', 10, 2, '2026-10-21', 'Normal'),
  ('Milk', 'Dairy', 9, 'litres', 10, 3, '2026-10-16', 'Low Stock'),
  ('Paneer', 'Dairy', 7, 'kg', 8, 3, '2026-10-17', 'Critical'),
  ('Cucumber', 'Vegetables', 18, 'kg', 8, 1, '2026-10-30', 'Normal');

INSERT INTO stock_transactions (ingredient_id, type, quantity, unit_price, updated_at) VALUES
  (1, 'purchase', 22, 35.00, '2026-10-10 09:00:00'),
  (2, 'usage', 5, 28.00, '2026-10-11 13:30:00'),
  (3, 'purchase', 12, 175.00, '2026-10-12 11:15:00');

INSERT INTO food_waste (ingredient_name, quantity, reason, waste_date, estimated_loss) VALUES
  ('Spinach', 2.5, 'Overstock on leafy greens', '2026-10-11 08:00:00', 95.00),
  ('Milk', 1.4, 'Expiry near threshold', '2026-10-12 11:30:00', 72.00),
  ('Paneer', 1.0, 'Storage temperature issue', '2026-10-14 07:45:00', 120.00);

INSERT INTO activity_logs (action, actor, created_at) VALUES
  ('Menu updated', 'admin', '2026-10-13 09:10:00'),
  ('Stock restocked', 'staff', '2026-10-13 13:40:00'),
  ('Waste report generated', 'admin', '2026-10-14 16:25:00');
