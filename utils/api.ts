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
    };

    // Add base URL for production
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const finalUrl = `${baseUrl}${url}${
      url.includes("?") ? "&" : "?"
    }_t=${Date.now()}`;

    const response = await fetch(finalUrl, {
      ...options,
      headers,
      // Add credentials for cookie handling
      credentials: "include",
    });

    // Handle token expiration
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    return response;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}
