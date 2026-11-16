// PART 2 - the CORS policy of the API.
// In the real project this is django-cors-headers: CORS_ALLOWED_ORIGINS in settings.py. Here it is the object that
// the simulated network (and the headless client's fake server) consult before answering a browser.
// Run it with:  npm test -- cors
//
// Team decision: ONLY the origin where `npm run dev` serves the React app is authorized.
//   - An origin is scheme + host + port: http://localhost:3000 or https://localhost:5173 are OTHER origins.
//   - No trailing slash (the browser sends "Origin: http://localhost:5173", never with a path).
//   - No wildcard "*": it would let ANY website read the API from a visitor's browser.
//   - No credentials (cookies) are needed: the API is called with plain JSON requests.
//
// Django equivalent (backend/config/settings.py):
//   CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
//   CORS_ALLOW_CREDENTIALS = False
export const corsPolicy = Object.freeze({
  allowedOrigins: Object.freeze(["http://localhost:5173"]),
  allowCredentials: false,
});
