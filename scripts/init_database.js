const mysql = require("mysql2/promise");
require("dotenv").config();

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: "Adam000777",
    user: "root",
    password: "abdulmalik99",
    port: 3306,
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS customizableForm`);
    console.log("Database created or already exists.");

    await connection.query(`USE customizableForm`);
    console.log("Using customizableForm database.");

    console.log("Database initialization completed successfully.");
  } catch (error) {
    console.error("Error initializing the database:", error);
  } finally {
    await connection.end();
  }
}

initDatabase();
