const express = require("express");
const {
  sendWhatsAppMessage,
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
    // console.log(contacts);

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
    // console.log(templateData);

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
    // console.log(templates);

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
router.post("/submit-endpoint", async (req, res) => {
  const { updatedJsonbody, contact, channel } = req.body;
  // console.log(contact);

  // Fetch HubSpot contacts
  const contacts = await fetchHubSpotContacts();
  // console.log(contacts);

  // Extract phone numbers from contacts (assuming `phone` is a property inside the `properties` object)
  let phoneNumbers = contacts.map((contact) => contact.properties.phone);

  // console.log(phoneNumbers);

  // Check if we need to send the message to multiple contacts or a single one
  if (contact === "true") {
    // Send message to all phone numbers
    phoneNumbers.forEach((phoneNumber) => {
      sendWhatsAppMessage(phoneNumber, updatedJsonbody, channel);
    });
  } else if (Array.isArray(contact)) {
    // Send message to all selected contacts
    contact.forEach((contact) => {
      sendWhatsAppMessage(contact, updatedJsonbody, channel);
    });
  } else {
    // Send message to the selected contact
    sendWhatsAppMessage(contact, updatedJsonbody, channel);
  }

  // Handle the form submission (store, send, etc.)
  res.send("Form submitted successfully!");
});

module.exports = router;
