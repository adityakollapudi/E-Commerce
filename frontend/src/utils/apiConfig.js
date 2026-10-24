/**
 * Resolves API endpoints across environments:
 * - In Production: Uses VITE_API_URL or VITE_API_BASE_URL if configured.
 * - In Local Development:
 *    - If running on Storefront port 5173, admin mutations route directly to Admin API port 5001.
 *    - If running on Admin port 5174, requests proxy to 5001 via Vite proxy.
 */
const BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export const getAdminApiUrl = (endpoint) => {
  if (!endpoint) return "";
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (BASE_URL) {
    return `${BASE_URL}${cleanEndpoint}`;
  }

  if (typeof window !== "undefined" && window.location.port === "5173") {
    const protocol = window.location.protocol || "http:";
    const hostname = window.location.hostname || "localhost";
    return `${protocol}//${hostname}:5001${cleanEndpoint}`;
  }

  return cleanEndpoint;
};

export const getApiUrl = (endpoint) => {
  if (!endpoint) return "";
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (BASE_URL) {
    return `${BASE_URL}${cleanEndpoint}`;
  }

  return cleanEndpoint;
};
