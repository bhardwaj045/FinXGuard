const BACKEND_URL = (import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080').replace(/\/+$/, '');
const PRODUCER_URL = (import.meta.env.VITE_PRODUCER_API_URL || 'http://localhost:8081').replace(/\/+$/, '');

export const SESSION_TOKEN_KEY = 'finxguard_session_token';
export const backendUrl = `${BACKEND_URL}/api`;
export const producerUrl = `${PRODUCER_URL}/api/producer`;

function userFacingMessage(status, serverMessage, path, method) {
  if (status === 400) return serverMessage || 'Please check the information and try again.';
  if (status === 401) {
    if (path === '/auth/login' && method === 'POST') {
      return serverMessage || 'Invalid email or password.';
    }
    return 'Your session has expired. Please sign in again.';
  }
  if (status === 403) return serverMessage || 'You do not have permission to access this resource.';
  if (status === 404) return serverMessage || 'The requested resource was not found.';
  if (status === 409) return serverMessage || 'An account with this email already exists.';
  if (status === 503 && path === '/auth/admin/register' && method === 'POST') {
    return 'Initial administrator registration is not configured. Ask the system operator to configure the admin registration key.';
  }
  if (status >= 500) return 'FinXGuard services are temporarily unavailable.';
  return serverMessage || `Request failed (${status}).`;
}

export async function requestApi(baseUrl, path, options = {}) {
  const method = options.method || 'GET';
  const isLoginRequest = path === '/auth/login' && method.toUpperCase() === 'POST';
  const headers = new Headers(options.headers || {});
  const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  let response;
  
 try {
  response = await fetch(`${baseUrl}${path}`, { ...options, headers });
} catch (error) {
  console.error('FinXGuard API request failed:', {
    url: `${baseUrl}${path}`,
    method,
    error
  });

  throw new Error(
    `Cannot connect to FinXGuard backend at ${baseUrl}${path}`
  );
}

  const text = response.status === 204 ? '' : await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (response.status === 401 && !isLoginRequest) {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    window.dispatchEvent(new CustomEvent('finxguard:unauthorized'));
  }

  if (!response.ok) {
    const message = typeof body === 'string'
      ? body
      : body?.detail || body?.message || body?.error;
    const error = new Error(userFacingMessage(response.status, message, path, method));
    error.status = response.status;
    throw error;
  }
  return body;
}

export const backendRequest = (path, options) => requestApi(backendUrl, path, options);
export const producerRequest = (path, options) => requestApi(producerUrl, path, options);
