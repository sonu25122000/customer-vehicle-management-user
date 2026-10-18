import axios from 'axios';
import { requestFinished, requestStarted } from '../utils/loading';

// Always the same-origin '/api' path — proxied to the backend by the Vite dev server locally and by
// vercel.json's rewrites in production, so the customer login cookie is first-party.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Every request shows the RoamWheels loader until its response arrives (utils/loading.js), unless it's
// made with { silent: true }.
api.interceptors.request.use((config) => {
  if (!config.silent) {
    requestStarted();
    config.countedForLoader = true;
  }
  return config;
});

function finished(config) {
  if (config?.countedForLoader) {
    config.countedForLoader = false;
    requestFinished();
  }
}

api.interceptors.response.use(
  (res) => {
    finished(res.config);
    return res;
  },
  (err) => {
    finished(err.config);
    return Promise.reject(err);
  }
);

export function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.message || fallback;
}

export default api;
