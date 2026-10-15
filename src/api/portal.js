import api from './client';

// Customer-site endpoints — see backend routes/portalRoutes.js.

export function signup(payload) {
  return api.post('/portal/auth/signup', payload).then((res) => res.data.customer);
}

export function login(mobile, password) {
  return api.post('/portal/auth/login', { mobile, password }).then((res) => res.data.customer);
}

export function logout() {
  return api.post('/portal/auth/logout');
}

export function fetchMe() {
  return api.get('/portal/auth/me').then((res) => res.data.customer);
}

// Required on the first login of a customer the team created (customer.mustChangePassword).
export function changePassword(currentPassword, newPassword) {
  return api.post('/portal/auth/change-password', { currentPassword, newPassword }).then((res) => res.data.customer);
}

export function fetchProfile() {
  return api.get('/portal/profile').then((res) => res.data.data);
}

// Name and email only — the mobile number is the login and can't be changed.
export function updateProfile(payload) {
  return api.patch('/portal/profile', payload).then((res) => res.data.data);
}

export function uploadDocuments(files) {
  const form = new FormData();
  Object.entries(files).forEach(([type, file]) => {
    if (file) form.append(type, file);
  });
  return api
    .post('/portal/documents', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data.data);
}

// Public — no login needed. `search` matches make, model, type, fuel or transmission.
export function fetchVehicles({ search, limit, startDate, endDate } = {}) {
  return api.get('/portal/vehicles', { params: { search, limit, startDate, endDate } }).then((res) => res.data.data);
}

export function vehiclePhotoUrl(photoId) {
  return `/api/portal/vehicle-photos/${photoId}`;
}

// Public — live coupons the team chose to show on the site.
export function fetchOffers() {
  return api.get('/portal/offers').then((res) => res.data.data);
}

export function fetchTrips() {
  return api.get('/portal/trips').then((res) => res.data.data);
}

export function fetchTrip(id) {
  return api.get(`/portal/trips/${id}`).then((res) => res.data.data);
}

// Start ('start') or end ('end') a trip with the OTP the team shared.
export function submitTripOtp(id, mode, otp) {
  return api.post(`/portal/trips/${id}/${mode}`, { otp }).then((res) => res.data);
}

export function rateTrip(id, rating, review) {
  return api.post(`/portal/trips/${id}/rating`, { rating, review }).then((res) => res.data);
}

export function createBooking(payload) {
  return api.post('/portal/trips', payload).then((res) => res.data);
}
