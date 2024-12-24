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

  const separator = url.includes("?") ? "&" : "?";
  const finalUrl = `${url}${separator}_t=${Date.now()}`;

  const response = await fetch(finalUrl, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error("Unauthorized: Invalid token");
    }
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response;
}
