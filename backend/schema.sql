CREATE DATABASE IF NOT EXISTS livraison_app;
USE livraison_app;

CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  motdepasse VARCHAR(100),
  type ENUM('client', 'livreur') NOT NULL
);

CREATE TABLE commandes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT,
  livreur_id INT,
  latitude FLOAT,
  longitude FLOAT,
  statut TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);