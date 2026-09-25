import { CONFIG } from "../config/config.js";

export interface AuthResponse {
  accessToken: string;
  user?: {
    id: string;
    email: string;
  };
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem("userId");
}

export async function loginUser(
  email: string,
  password: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${CONFIG.API.BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) return false;

    const data = (await response.json()) as AuthResponse;
    if (
      data !== null &&
      typeof data === "object" &&
      typeof data.accessToken === "string"
    ) {
      localStorage.setItem("accessToken", data.accessToken);
      if (
        data.user !== undefined &&
        typeof data.user === "object" &&
        typeof data.user.id === "string"
      ) {
        localStorage.setItem("userId", data.user.id);
      }
      return true;
    }
    return false;
  } catch (error: unknown) {
    console.error("Error logging in:", error);
    return false;
  }
}

export function logoutUser(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
}
