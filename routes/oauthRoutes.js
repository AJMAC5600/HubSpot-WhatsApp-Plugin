const express = require("express");
const router = express.Router();
const {
  getHubSpotAccessToken,
  refreshAccessToken,
} = require("../controllers/oauthController");

// OAuth route for HubSpot authorization
router.get("/oauth", (req, res) => {
  const hubSpotAuthUrl = `https://app.hubspot.com/oauth/authorize?client_id=${process.env.HUBSPOT_CLIENT_ID}&redirect_uri=${process.env.HUBSPOT_REDIRECT_URI}&scope=crm.objects.contacts.read crm.objects.contacts.write oauth`;
  console.log(hubSpotAuthUrl);
  res.redirect(hubSpotAuthUrl);
});

// Callback route to get the access token
router.get("/oauth/callback", getHubSpotAccessToken);

// Optional: Route for manual token refresh
router.get("/refresh", (req, res) => {
  refreshAccessToken();
  res.send("Token refresh initiated.");
});

module.exports = router;
