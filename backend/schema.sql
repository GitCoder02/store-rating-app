CREATE DATABASE IF NOT EXISTS store_rating_db;
USE store_rating_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  address VARCHAR(400) NOT NULL,
  role ENUM('ADMIN', 'NORMAL_USER', 'STORE_OWNER') NOT NULL DEFAULT 'NORMAL_USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  address VARCHAR(400) NOT NULL,
  owner_id INT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  store_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_store (user_id, store_id)
);

-- Seed Initial Demo Accounts (Password for all: Password123!)
-- All user names strictly satisfy 20-60 characters constraint
INSERT INTO users (id, name, email, password, address, role) VALUES
(1, 'Rajeshwar Narayan Kulkarni', 'admin@storerating.com', '$2a$10$cu4Jz1O0qD9jxB/o0td8TekMhk4Skz4C978G6xC4GBepLSw0P8IOC', 'Flat 402, Rohan Leher Phase 2, Baner, Pune, Maharashtra 411045', 'ADMIN'),
(2, 'Vikramaditya Suresh Patil', 'vikram.patil@storeowner.com', '$2a$10$cu4Jz1O0qD9jxB/o0td8TekMhk4Skz4C978G6xC4GBepLSw0P8IOC', 'Bungalow 14, Pallod Farms, Near Ganraj Chowk, Baner, Pune 411045', 'STORE_OWNER'),
(3, 'Siddharth Chandrakant Joshi', 'siddharth.joshi@storeowner.com', '$2a$10$cu4Jz1O0qD9jxB/o0td8TekMhk4Skz4C978G6xC4GBepLSw0P8IOC', 'Tower 3, Apt 804, Kasturi The Balmoral, Balewadi, Pune 411045', 'STORE_OWNER'),
(4, 'Aditya Shrikant Kulkarni', 'aditya.kulkarni@usermail.com', '$2a$10$cu4Jz1O0qD9jxB/o0td8TekMhk4Skz4C978G6xC4GBepLSw0P8IOC', 'Row House 6, Cosmos Regency, Aundh-Baner Link Road, Pune 411045', 'NORMAL_USER'),
(5, 'Priyanka Mangesh Deshpande', 'priyanka.deshpande@usermail.com', '$2a$10$cu4Jz1O0qD9jxB/o0td8TekMhk4Skz4C978G6xC4GBepLSw0P8IOC', 'Flat 301, VTP Solitaire, Near Pancard Club Road, Baner, Pune 411045', 'NORMAL_USER')
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), address=VALUES(address), role=VALUES(role);

-- Seed Initial Stores in and around Baner, Pune
INSERT INTO stores (id, name, email, address, owner_id) VALUES
(1, 'Dorabjee Gourmet Supermarket', 'dorabjees.baner@stores.com', 'Shop 4, Primrose Mall, Baner-Mahalunge Road, Baner, Pune 411045', 2),
(2, 'Vijay Sales Electronics Hub', 'vijaysales.baner@stores.com', 'Survey 81/1, Near Pancard Club Road, Baner, Pune 411045', 3),
(3, 'Wildcraft Adventure Gear Store', 'wildcraft.balewadi@stores.com', 'Unit 12, High Street Mall, Balewadi High Street, Pune 411045', NULL)
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), address=VALUES(address), owner_id=VALUES(owner_id);

-- Seed Initial Ratings (1-5 stars)
INSERT INTO ratings (user_id, store_id, rating) VALUES
(4, 1, 5),
(4, 2, 4),
(5, 1, 5),
(5, 3, 4)
ON DUPLICATE KEY UPDATE rating=VALUES(rating);
