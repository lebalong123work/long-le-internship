import { CONFIG } from "../config/config.js";

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url: string = `${CONFIG.API.BASE_URL}${endpoint}`;
  const token: string | null = localStorage.getItem("accessToken");

  const headers = new Headers(options.headers);

  if (token !== null) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  options.headers = headers;

  const response: Response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API Request Failed: ${response.status}`);
  }

  return (await response.json()) as T;
}