export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found");
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      // Add a cache-busting query parameter
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const finalUrl = `${baseUrl}${url}`;

    // Add a cache-busting query parameter
    const urlWithCacheBuster = `${finalUrl}${
      finalUrl.includes("?") ? "&" : "?"
    }_t=${Date.now()}`;

    const response = await fetch(urlWithCacheBuster, {
      ...options,
      headers,
      credentials: "include",
    });

    if (response.status === 401) {
      // Token might be expired, throw an error to be handled by the component
      throw new Error("Unauthorized: Token might be expired");
    }

    return response;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}
