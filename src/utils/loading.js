// How many API requests are waiting for a response — the RoamWheels loader (components/Loader.jsx) shows
// while this is above zero. api/client.js counts every request, except ones made with { silent: true }
// (background refreshes the visitor didn't ask for).
let pending = 0;
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

export function requestStarted() {
  pending += 1;
  emit();
}

export function requestFinished() {
  pending = Math.max(0, pending - 1);
  emit();
}

export function subscribeLoading(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isLoading() {
  return pending > 0;
}
