import { CONFIG } from "@/config";
export interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function fetchAPI(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<unknown> {
  const url: string = `${CONFIG.API.BASE_URL}${endpoint}`;
  const token: string | null = localStorage.getItem("accessToken");

  if (!options.headers) {
    options.headers = {};
  }

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  const response: Response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API Request Failed: ${response.status}`);
  }

  if (options.method === "DELETE") {
    return response.ok;
  }
  const responseData: unknown = await response.json();
  return responseData;
}
