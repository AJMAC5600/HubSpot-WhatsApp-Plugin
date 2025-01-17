// config/database.js
const mysql = require("mysql2");

// MySQL connection setup
const db = mysql.createConnection({
  host: "localhost", // Change if using a remote MySQL server
  user: "root", // Your MySQL username
  password: "", // Your MySQL password
  database: "hubspot_plugin", // Your MySQL database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.stack);
    return;
  }
  console.log("Connected to MySQL as ID " + db.threadId);

  // Create 'settings' table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hubspotClientId VARCHAR(255) NOT NULL,
      hubspotClientSecret VARCHAR(255) NOT NULL,
      whatsappApiKey VARCHAR(255) NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      expires_at DATETIME
    )
  `;

  db.query(createTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating 'settings' table:", err);
    } else {
      console.log("'settings' table is ready.");
    }
  });
});

module.exports = db;
