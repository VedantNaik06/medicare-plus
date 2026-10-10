import axios from 'axios';

// In development the base URL is "/api" (Vite forwards it to Express).
// In production on separate domains, set VITE_API_URL.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // send the HttpOnly login cookie
  headers: { 'X-Requested-With': 'medicare-web' }, // required by the server's CSRF check
});

// If the login expires while the app is open, tell the rest of the app (AuthContext listens).
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const code = error.response?.data?.error?.code;
    const url = error.config?.url || '';
    const isAuthCall = url.startsWith('/auth/');
    if (!isAuthCall && (code === 'SESSION_EXPIRED' || code === 'AUTH_REQUIRED')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);
