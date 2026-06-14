const API_BASE = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export const apiRequest = async (
  path,
  {
    body,
    headers = {},
    method = "GET",
    suppressUnauthorizedEvent = false,
  } = {},
) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !suppressUnauthorizedEvent) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    throw new ApiError(
      data.message || "The request could not be completed.",
      response.status,
      data.errors,
    );
  }

  return data;
};
