require("dotenv").config();

// Controller to fetch contacts from HubSpot API
const fetchHubSpotContacts = async () => {
  const apiUrl =
    "https://api.hubapi.com/crm/v3/objects/contacts?properties=firstname,lastname,email,phone"; // HubSpot API URL
  const apiKey = process.env.ACCESS_TOKEN; // Your HubSpot API key from environment variables

  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };

  const requestOptions = {
    method: "GET",
    headers: headers,
    redirect: "follow",
  };

  try {
    // Make the fetch request to the HubSpot API
    const response = await fetch(apiUrl, requestOptions);

    // Ensure response is okay (status 200 range)
    if (!response.ok) {
      throw new Error(`Error fetching contacts: ${response.statusText}`);
    }

    const result = await response.json(); // Parse the response as JSON

    console.log("Fetched HubSpot Contacts:", result.results);
    return result.results || []; // Adjust to the actual response structure
  } catch (error) {
    console.error("Error fetching contacts from HubSpot:", error);
    return []; // Return an empty array in case of error
  }
};

module.exports = { fetchHubSpotContacts };
