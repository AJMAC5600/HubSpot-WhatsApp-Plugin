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
});

module.exports = db;
