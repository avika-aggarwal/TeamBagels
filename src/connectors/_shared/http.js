// Minimal fetch wrapper shared by every connector and service:
// builds the URL + query string, sends JSON (or FormData), enforces a timeout,
// and throws on non-2xx so `withFallback` can switch to a mock.
async function request(url, { method = 'GET', query, body, headers = {}, timeoutMs = 15000 } = {}) {
  const target = new URL(url, window.location.origin);
  Object.entries(query || {}).forEach(([key, value]) => target.searchParams.set(key, value));

  const isForm = body instanceof FormData;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(target, {
      method,
      signal: controller.signal,
      headers: { ...(body && !isForm && { 'Content-Type': 'application/json' }), ...headers },
      body: body && !isForm ? JSON.stringify(body) : body,
    });
    if (!response.ok) throw new Error(`${method} ${target.pathname} -> ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export const http = {
  get: (url, options) => request(url, options),
  post: (url, body, options) => request(url, { ...options, method: 'POST', body }),
};
