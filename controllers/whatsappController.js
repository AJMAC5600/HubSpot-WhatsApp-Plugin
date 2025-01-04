// controllers/whatsappController.js
const fetch = require("node-fetch");
const config = require("../config/config");
const db = require("../config/database");

const sendWhatsAppMessage = async (to, message) => {
  const whatsappApiUrl = `${config.whatsapp.apiUrl}/v13.0/messages`;

  const headers = {
    Authorization: `Bearer ${config.whatsapp.apiKey}`,
    "Content-Type": "application/json",
  };

  const body = JSON.stringify({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "text",
    text: { body: message },
  });

  try {
    const response = await fetch(whatsappApiUrl, {
      method: "POST",
      headers,
      body,
    });

    const result = await response.json();
    console.log("WhatsApp Message Sent:", result);
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
};

module.exports = { sendWhatsAppMessage };
