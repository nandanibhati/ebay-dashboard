export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getToken() {
  return localStorage.getItem("token");
}

export function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Wraps fetch(): prefixes API_BASE_URL and attaches the saved auth token.
// Pass a FormData body as-is; a plain object body is JSON-stringified.
export async function apiFetch(path, options = {}) {
  const { body, headers, ...rest } = options;
  const isFormData = body instanceof FormData;

  const finalHeaders = {
    ...authHeader(),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...headers,
  };

  const finalBody =
    !isFormData && body !== undefined && typeof body !== "string"
      ? JSON.stringify(body)
      : body;

  return fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  });
}
