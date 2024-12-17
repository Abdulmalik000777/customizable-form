const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_mysql_password",
  });

  try {
    const sqlScript = fs.readFileSync(
      path.join(__dirname, "setup_database.sql"),
      "utf8"
    );
    const statements = sqlScript
      .split(";")
      .filter((statement) => statement.trim() !== "");

    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log("Database setup completed successfully.");
  } catch (error) {
    console.error("Error setting up the database:", error);
  } finally {
    await connection.end();
  }
}

setupDatabase();
