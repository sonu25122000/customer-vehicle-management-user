import axios from 'axios';

// Always the same-origin '/api' path — proxied to the backend by the Vite dev server locally and by
// vercel.json's rewrites in production, so the customer login cookie is first-party.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.message || fallback;
}

export default api;
