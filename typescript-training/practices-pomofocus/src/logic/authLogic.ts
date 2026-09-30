import { CONFIG } from "@/config";

export interface AuthResponse {
  accessToken: string;
  user?: {
    id: string | number;
    email: string;
  };
}

function isAuthResponse(value: unknown): value is AuthResponse {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  if (!("accessToken" in value) || typeof value.accessToken !== "string") {
    return false;
  }

  if (!("user" in value) || value.user === undefined) {
    return true;
  }

  const user = value.user;
  return (
    typeof user === "object" &&
    user !== null &&
    !Array.isArray(user) &&
    "id" in user &&
    (typeof user.id === "string" || typeof user.id === "number") &&
    "email" in user &&
    typeof user.email === "string"
  );
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
    const data: unknown = await response.json();
    if (!isAuthResponse(data)) return false;

    localStorage.setItem("accessToken", data.accessToken);
    if (data.user !== undefined) {
      localStorage.setItem("userId", String(data.user.id));
    }
    return true;
  } catch (error: unknown) {
    console.error("Error logging in:", error);
    return false;
  }
}

export function logoutUser(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
}
