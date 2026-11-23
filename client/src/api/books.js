
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(endpoint, options = {}) {
  const hasBody = options.body !== undefined;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export function getBooks(params = {}, signal) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  const endpoint = query ? `/api/books?${query}` : "/api/books";

  return request(endpoint, { signal });
}

export function getBook(id) {
  return request(`/api/books/${id}`);
}

export function createBook(book) {
  return request("/api/books", {
    method: "POST",
    body: JSON.stringify(book),
  });
}

export function updateBook(id, book) {
  return request(`/api/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(book),
  });
}

export function patchBook(id, changes) {
  return request(`/api/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function deleteBook(id) {
  return request(`/api/books/${id}`, {
    method: "DELETE",
  });
}

export function getStats() {
  return request("/api/stats");
}
