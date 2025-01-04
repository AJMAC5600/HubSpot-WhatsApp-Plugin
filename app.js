// app.js
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const oauthRoutes = require("./routes/oauthRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
require("dotenv").config(); // Make sure this line is at the top of your app.js or server.js
const cron = require("node-cron");
const { renewAccessToken } = require("./controllers/oauthController");

const app = express();
const port = process.env.PORT || 3000;

// Serve static files (like CSS) from the "public" directory
app.use(express.static(path.join(__dirname, "assets")));

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// View engine setup (EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use(oauthRoutes);
app.use(settingsRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

  // Schedule token renewal every hour
  cron.schedule("0 * * * *", async () => {
    console.log("Running scheduled token renewal...");
    await renewAccessToken();
  });
});
