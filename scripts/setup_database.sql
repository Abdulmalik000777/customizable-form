-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS customizable_forms;

-- Use the created database
USE customizable_forms;

-- Create the Template table
CREATE TABLE IF NOT EXISTS Template (
  id VARCHAR(191) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL
);

-- Create the Question table
CREATE TABLE IF NOT EXISTS Question (
  id VARCHAR(191) PRIMARY KEY,
  type VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  required BOOLEAN NOT NULL DEFAULT false,
  templateId VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  FOREIGN KEY (templateId) REFERENCES Template(id)
);

