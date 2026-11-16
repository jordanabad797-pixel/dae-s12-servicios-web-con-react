// PART 1 - the API client module: the ONLY place that knows the API's address and how its errors look.
// No component writes a URL by hand; they all call these functions.
// Run it with:  npm test -- api
import axios from "axios";

const DEFAULT_API_URL = "http://localhost:8000/api";

/**
 * The base address of the API, in ONE place. A `.env.local` with VITE_API_URL wins (for example, the real Django
 * API of week 8); otherwise the default. Trailing slashes are removed so that "base + /exams/" never doubles them.
 */
export const API_URL = (import.meta.env?.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");

/** Maximum time a request may take before Axios gives up (code ECONNABORTED). */
export const REQUEST_TIMEOUT_MS = 8000;

/** The single Axios instance of the app. Tests and `npm run dev` swap its adapter for the simulated network. */
export const api = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { Accept: "application/json" },
});

/**
 * GET /exams/ -> the array of exams.
 * The `signal` (from an AbortController) lets the caller cancel the request when it no longer matters.
 */
export async function listExams({ signal } = {}) {
  const response = await api.get("/exams/", { signal });
  return response.data;
}

/** POST /exams/ with { title } -> the exam the server created (with its id). */
export async function createExam(title) {
  const response = await api.post("/exams/", { title });
  return response.data;
}

/** DELETE /exams/<id>/ -> undefined. The path ends with a slash, as Django REST Framework expects. */
export async function deleteExam(id) {
  await api.delete(`/exams/${encodeURIComponent(id)}/`);
  return undefined;
}

const TIMEOUT_CODES = new Set(["ECONNABORTED", "ETIMEDOUT"]);

/** Joins DRF validation errors ({ title: ["msg"], non_field_errors: [...] }) into one readable sentence. */
function formatValidationErrors(data) {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (!data || typeof data !== "object") return "";
  return Object.entries(data)
    .map(([field, messages]) => `${field}: ${[].concat(messages).join(" ")}`)
    .join(" · ");
}

/**
 * Turns anything the client can throw into ONE sentence in Spanish for the person. Never returns an empty string.
 * The order matters: a timeout and a network error have no `response`, so they are checked before the status.
 */
export function describeError(error) {
  if (axios.isCancel(error)) {
    return "La petición se canceló porque ya no era necesaria.";
  }

  if (TIMEOUT_CODES.has(error?.code)) {
    return `La API tardó demasiado en responder (más de ${REQUEST_TIMEOUT_MS / 1000} s). Intenta de nuevo.`;
  }

  const response = error?.response;
  if (!response) {
    if (error?.code === "ERR_NETWORK") {
      // The browser hides the reason: a server that is off and a CORS block look the same to the page.
      return (
        "No se pudo conectar con la API. Revisa que el servidor esté encendido y que este origen " +
        "esté autorizado en CORS."
      );
    }
    return "Ocurrió un error inesperado al comunicarse con la API. Intenta de nuevo.";
  }

  const { status, data } = response;
  if (status === 400) {
    const details = formatValidationErrors(data);
    return details ? `Datos no válidos. ${details}` : "Datos no válidos: revisa el formulario.";
  }
  if (status === 404) return "El recurso ya no existe en el servidor (quizá otra persona lo eliminó).";
  if (status >= 500) return `La API falló (error ${status}). Intenta de nuevo en unos minutos.`;
  return `La API respondió con el estado ${status} y no se pudo completar la operación.`;
}
