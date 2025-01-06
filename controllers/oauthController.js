// const fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));
const db = require("../config/database");
const { updateEnv } = require("../utils/updateEnv");

// Function to retrieve HubSpot access token
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

    // Save access token and other details into the database
    const updateQuery = `
      UPDATE settings 
      SET access_token = ?, refresh_token = ?, expires_at = ? 
      WHERE hubspotClientId = ?
    `;
    await new Promise((resolve, reject) => {
      db.query(
        updateQuery,
        [
          data.access_token,
          data.refresh_token,
          new Date(newExpiryTime).toISOString(),
          process.env.HUBSPOT_CLIENT_ID,
        ],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    updateEnv("ACCESS_TOKEN", data.access_token); // Optional: Update .env file
    res.redirect("/templates");
  } catch (error) {
    console.error("Error during OAuth token retrieval:", error);
    res.status(500).send("Error retrieving OAuth token.");
  }
};

// Function to refresh the access token if it's about to expire
const refreshAccessToken = async () => {
  const query = `
    SELECT hubspotClientId, hubspotClientSecret, access_token, refresh_token, expires_at 
    FROM settings 
    WHERE hubspotClientId = ? LIMIT 1
  `;

  try {
    // Fetch settings from the database
    const [settings] = await new Promise((resolve, reject) => {
      db.query(query, [process.env.HUBSPOT_CLIENT_ID], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0)
          return reject(new Error("No settings found."));
        resolve(results);
      });
    });

    const { hubspotClientId, hubspotClientSecret, refresh_token, expires_at } =
      settings;
    const currentTime = Date.now();

    if (new Date(expires_at).getTime() - currentTime <= 10 * 60 * 1000) {
      console.log("Refreshing access token...");

      const url = "https://api.hubapi.com/oauth/v1/token";
      const params = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: hubspotClientId,
        client_secret: hubspotClientSecret,
        refresh_token,
      });

      console.log("Request Params:", params.toString()); // Log params for debugging

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });

      if (!response.ok) {
        const errorData = await response.json(); // Log full error response
        console.error("HubSpot API error:", errorData);
        throw new Error(
          `HTTP error! Status: ${response.status} - ${errorData.message}`
        );
      }

      const data = await response.json();
      const newExpiryTime = Date.now() + data.expires_in * 1000;

      // Update the database with the new token and expiry time
      const updateQuery = `
        UPDATE settings 
        SET access_token = ?, refresh_token = ?, expires_at = ? 
        WHERE hubspotClientId = ?
      `;
      await new Promise((resolve, reject) => {
        db.query(
          updateQuery,
          [
            data.access_token,
            data.refresh_token,
            new Date(newExpiryTime).toISOString(),
            hubspotClientId,
          ],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });

      console.log("Access token refreshed and updated in the database.");
      updateEnv("ACCESS_TOKEN", data.access_token); // Optional: Update .env file
    } else {
      console.log("Access token is still valid. No need to refresh.");
    }
  } catch (error) {
    console.error("Error during token refresh:", error.message || error);
  }
};

module.exports = { getHubSpotAccessToken, refreshAccessToken };
