// routes/settingsRoutes.js
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
  const query = `
    INSERT INTO settings (hubspotClientId, hubspotClientSecret, whatsappApiKey)
    VALUES (?, ?, ?)
  `;

  db.query(
    query,
    [hubspotClientId, hubspotClientSecret, whatsappApiKey],
    (err, results) => {
      if (err) {
        console.error("Error saving settings:", err);
        return res.status(500).send("Error saving settings.");
      }
    }
  );

  updateEnv("HUBSPOT_CLIENT_ID", hubspotClientId);
  updateEnv("WHATSAPP_API_KEY", whatsappApiKey);

  // Respond with success and a link to initiate OAuth
  res.send(res.render("oauth"));
});

module.exports = router;
