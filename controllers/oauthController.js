const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { updateEnv } = require("../utils/updateEnv");

const getHubSpotAccessToken = async (req, res) => {
  const { code } = req.query;

  const url = "https://api.hubapi.com/oauth/v1/token";
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.HUBSPOT_CLIENT_ID,
    client_secret: process.env.HUBSPOT_CLIENT_SECRET,
    redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
    code,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const newExpiryTime = Date.now() + data.expires_in * 1000;
    const expiryDate = new Date(newExpiryTime);
    console.log(`Token expires on: ${expiryDate.toLocaleString()}`);
    updateEnv("ACCESS_TOKEN", data.access_token);
    res.status(200).send(data);
  } catch (error) {
    console.error("Error during OAuth token retrieval:", error);
    res.status(500).send("Error retrieving OAuth token.");
  }
};

module.exports = { getHubSpotAccessToken };
