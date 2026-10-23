CREATE DATABASE IF NOT EXISTS foodnest_db;
USE foodnest_db;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  username VARCHAR(60) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(60) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE food_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  category_id INT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_food_items_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(120) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT,
  customer_name VARCHAR(120) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending',
  order_status ENUM('Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled') DEFAULT 'Pending',
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  food_item_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_food FOREIGN KEY (food_item_id) REFERENCES food_items(id)
);

CREATE TABLE suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  contact_email VARCHAR(120),
  city VARCHAR(80),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ingredients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL,
  minimum_threshold DECIMAL(10,2) NOT NULL DEFAULT 0,
  supplier_id INT,
  expiry_date DATE,
  status VARCHAR(30) DEFAULT 'Normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ingredients_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE stock_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ingredient_id INT NOT NULL,
  type ENUM('purchase', 'usage', 'adjustment') NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stock_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

CREATE TABLE food_waste (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ingredient_name VARCHAR(120) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  reason VARCHAR(200) NOT NULL,
  waste_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estimated_loss DECIMAL(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  action VARCHAR(200) NOT NULL,
  actor VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_food_items_category ON food_items(category_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_ingredients_expiry ON ingredients(expiry_date);
CREATE INDEX idx_ingredients_status ON ingredients(status);
CREATE INDEX idx_waste_date ON food_waste(waste_date);
