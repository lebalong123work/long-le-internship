import { CONFIG } from "../config/config.js";

export async function fetchAPI(endpoint, options = {}) {
  const url = `${CONFIG.API.BASE_URL}${endpoint}`;
  const token = localStorage.getItem("accessToken");

  if (!options.headers) {
    options.headers = {};
  }

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API Request Failed: ${response.status}`);
  }

  if (options.method === "DELETE") {
    return response.ok;
  }

  return response.json();
}
