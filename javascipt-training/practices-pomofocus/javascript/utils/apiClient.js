import { CONFIG } from "../config.js";

export async function fetchAPI(endpoint, options = {}) {
  const url = `${CONFIG.API.BASE_URL}${endpoint}`;
  
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API Request Failed: ${response.status}`);
  }

  if (options.method === "DELETE") {
    return response.ok;
  }

  return response.json();
}