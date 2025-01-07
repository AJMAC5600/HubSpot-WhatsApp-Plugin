const path = require("path");
const bodyParser = require("body-parser");
const cron = require("node-cron");
// Load environment variables early
const session = require("express-session");

require("dotenv").config();

const oauthRoutes = require("./routes/oauthRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const templateRoutes = require("./routes/templateRoutes");
const { refreshAccessToken } = require("./controllers/oauthController");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, "assets"))); // Serve static files
app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Using a hardcoded secret key (not recommended for production)
app.use(
  session({
    secret: "mySuperSecretKey12345", // Choose any strong string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.get("/template-selection", async (req, res) => {
  try {
    const contacts = await getContactsFromHubSpot(); // Function to fetch contacts
    const channels = await getChannels(); // Function to fetch channels
    const categories = await getCategories(); // Function to fetch categories
    const templates = await getTemplates(); // Function to fetch templates

    res.render("templateSelection", {
      contacts,
      channels,
      categories,
      templates,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Middleware to parse JSON bodies (if needed)
app.use(express.json());

// Routes
app.use(oauthRoutes);
app.use(settingsRoutes);
app.use(templateRoutes);

// Token Renewal Scheduler
cron.schedule("*/5 * * * *", () => {
  console.log("Running scheduled token refresh...");
  refreshAccessToken();
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).send("Something went wrong!");
});
// reloadEnv();

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful Shutdown
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  process.exit();
});
