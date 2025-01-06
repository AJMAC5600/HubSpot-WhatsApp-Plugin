const express = require("express");
const {
  getChannelsFromAPI,
  getChannelTemplates,
  fetchTemplatePayload,
} = require("../controllers/whatsappController"); // Import functions from the controller
const { fetchHubSpotContacts } = require("../controllers/hubSpotController");
const router = express.Router();

// Route to load template selection page
router.get("/templates", async (req, res) => {
  try {
    // Fetch channels dynamically from the API
    const channels = await getChannelsFromAPI();

    // Static data for categories and contacts
    const categories = ["MARKETING", "UTILITY", "AUTHENTICATION"];
    const contacts = await fetchHubSpotContacts(); // Fetch contacts from HubSpot
    console.log(contacts);

    // Render the template selection page with empty templates initially
    res.render("templateSelection", {
      categories,
      channels,
      templates: [], // Empty initially
      contacts,
    });
  } catch (error) {
    console.error("Error fetching data for template selection:", error);
    res.status(500).send("Error fetching data for template selection.");
  }
});

const fetchTemplateFromRequest = async (req, res) => {
  const { template, channel } = req.body; // Get template name and channel number from the request body

  if (!template || !channel) {
    return res.status(400).send("Template or channel not provided");
  }

  try {
    // Fetch the template payload from the API
    const templateData = await fetchTemplatePayload(template, channel);

    // Return the template data to the frontend
    res.json({ success: true, template: templateData });
  } catch (error) {
    console.error("Error fetching template payload:", error);
    res.status(500).send("Error fetching template data");
  }
};

// Example route to handle template fetching
router.post("/templates/fetch", fetchTemplateFromRequest);
// Route to handle fetching templates for a selected channel
router.post("/save-channel", async (req, res) => {
  const { channel } = req.body;
  if (!channel) {
    return res.status(400).json({ error: "Channel is required." });
  }

  try {
    // Fetch templates for the selected channel
    const templates = await getChannelTemplates(channel);

    // Send the templates back as a JSON response
    res.json({ success: true, templates });
  } catch (error) {
    console.error("Error fetching channel templates:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch templates." });
  }
});

// Route to handle form submission (after selecting category, template, etc.)
router.post("/templates/submit", (req, res) => {
  const { category, channel, template, contact } = req.body;
  console.log("Form submitted with data:", {
    category,
    channel,
    template,
    contact,
  });

  // Handle the form submission (store, send, etc.)
  res.send("Form submitted successfully!");
});

module.exports = router;
