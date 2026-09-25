import { CONFIG } from "../config/config.js";
export interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function fetchAPI<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T | boolean> {
  const url: string = `${CONFIG.API.BASE_URL}${endpoint}`;
  const token: string | null = localStorage.getItem("accessToken");

  if (options.headers === undefined) {
    options.headers = {};
  }

  if (token !== null) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  const response: Response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API Request Failed: ${response.status}`);
  }

  if (options.method === "DELETE") {
    return response.ok;
  }

  return (await response.json()) as T;
}
