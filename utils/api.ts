export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // If the URL already has query parameters, use '&' instead of '?'
  const separator = url.includes("?") ? "&" : "?";
  const finalUrl = `${url}${separator}_t=${Date.now()}`;

  return fetch(finalUrl, { ...options, headers });
}
