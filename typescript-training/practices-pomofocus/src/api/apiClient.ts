import { CONFIG } from "../config/config.ts";

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T | boolean> {
  const url = `${CONFIG.API.BASE_URL}${endpoint}`;
  const token = localStorage.getItem("accessToken");

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  options.headers = headers;

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API Request Failed: ${response.status}`);
  }

  if (options.method === "DELETE") {
    return response.ok;
  }

  return (await response.json()) as T;
}
