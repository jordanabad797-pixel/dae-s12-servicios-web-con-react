// FIX 1 (CORS with wildcard): "*" let ANY website read the API from a visitor's browser.
// Only the project's origin, exact: scheme + host + port, no trailing slash.
export const corsPolicy = {
  allowedOrigins: ["http://localhost:5173"],
  allowCredentials: false,
};
