const express = require("express");
const router = express.Router();
const { updateEnv } = require("../utils/updateEnv");
const db = require("../config/database");

// Route for displaying the settings page
router.get("/", (req, res) => {
  res.render("settings");
});
router.get("/settings", (req, res) => {
  res.render("settings");
});

// Route for saving the settings (API keys, etc.)
router.post("/settings/save", (req, res) => {
  const { hubspotClientId, hubspotClientSecret, whatsappApiKey } = req.body;

  // Query to check if the settings with id = 1 already exist
  const checkQuery = "SELECT * FROM settings WHERE id = 1";

  db.query(checkQuery, (err, results) => {
    if (err) {
      console.error("Error checking settings:", err);
      return res.status(500).send("Error checking settings.");
    }

    if (results.length > 0) {
      // If the settings with id = 1 already exist, update the record
      const updateQuery = `
        UPDATE settings 
        SET hubspotClientId = ?, hubspotClientSecret = ?, whatsappApiKey = ? 
        WHERE id = 1
      `;

      db.query(
        updateQuery,
        [hubspotClientId, hubspotClientSecret, whatsappApiKey],
        (err) => {
          if (err) {
            console.error("Error updating settings:", err);
            return res.status(500).send("Error updating settings.");
          }
        }
      );
    } else {
      // If the settings with id = 1 don't exist, insert a new record
      const insertQuery = `
        INSERT INTO settings (id, hubspotClientId, hubspotClientSecret, whatsappApiKey)
        VALUES (1, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [hubspotClientId, hubspotClientSecret, whatsappApiKey],
        (err) => {
          if (err) {
            console.error("Error saving settings:", err);
            return res.status(500).send("Error saving settings.");
          }
        }
      );
    }

    // Update environment variables
    updateEnv("HUBSPOT_CLIENT_ID", hubspotClientId);
    updateEnv("WHATSAPP_API_KEY", whatsappApiKey);
    updateEnv("HUBSPOT_CLIENT_SECRET", hubspotClientSecret);

    // Respond with success and a link to initiate OAuth
    res.render("oauth");
  });
});

module.exports = router;
