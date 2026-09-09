import { CONFIG } from "../config/config.js";

export function getCurrentUserId() {
  return localStorage.getItem("userId");
}

export async function loginUser(email, password) {
  try {
    const response = await fetch(`${CONFIG.API.BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) return false;

    const data = await response.json();

    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      if (data.user?.id) {
        localStorage.setItem("userId", data.user.id);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error logging in:", error);
    return false;
  }
}

export function logoutUser() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
}
