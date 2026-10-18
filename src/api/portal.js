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

// Forgot password: emails a reset link to the account's email. `identifier` is the mobile number or email.
export function forgotPassword(identifier) {
  return api.post('/portal/auth/forgot-password', { identifier }).then((res) => res.data);
}

// Whether a reset link still works — resolves to { name } (first name), rejects if it's invalid/expired.
export function checkResetToken(token) {
  return api.post('/portal/auth/reset-password/check', { token }).then((res) => res.data.data);
}

// Sets the new password with the emailed link and logs in — resolves to the customer.
export function resetPassword(token, password) {
  return api.post('/portal/auth/reset-password', { token, password }).then((res) => res.data.customer);
}

export function fetchProfile() {
  return api.get('/portal/profile').then((res) => res.data.data);
}

// Name and email only — the mobile number is the login and can't be changed.
export function updateProfile(payload) {
  return api.patch('/portal/profile', payload).then((res) => res.data.data);
}

// Profile picture (JPEG/PNG/WebP, max 2 MB) — resolves to the updated customer (with photoVersion).
export function uploadProfilePhoto(file) {
  const form = new FormData();
  form.append('photo', file);
  return api
    .post('/portal/profile/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data.data);
}

export function removeProfilePhoto() {
  return api.delete('/portal/profile/photo').then((res) => res.data.data);
}

// <img src> for the signed-in customer's picture; the version changes with every upload.
export function profilePhotoUrl(version) {
  return `/api/portal/profile/photo?v=${version}`;
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

// Public — one car (Active cars only).
export function fetchVehicle(id) {
  return api.get(`/portal/vehicles/${id}`).then((res) => res.data.data);
}

// Public — customers' ratings and reviews of one car, newest first.
export function fetchVehicleReviews(id) {
  return api.get(`/portal/vehicles/${id}/reviews`).then((res) => res.data.data);
}

// Public — the home page reviews carousel (managed in the admin portal).
export function fetchTestimonials() {
  return api.get('/portal/testimonials').then((res) => res.data.data);
}

// Public — { cars, completedTrips, ratings, avgRating } for the home page.
export function fetchSiteStats() {
  return api.get('/portal/stats').then((res) => res.data.data);
}

export function vehiclePhotoUrl(photoId) {
  return `/api/portal/vehicle-photos/${photoId}`;
}

// Public — live coupons the team chose to show on the site.
export function fetchOffers() {
  return api.get('/portal/offers').then((res) => res.data.data);
}

// Public — the home page's "Let us know your email" form.
export function subscribe(email) {
  return api.post('/portal/subscribe', { email }).then((res) => res.data);
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

// Checks a coupon code for a booking (car + dates) — resolves to { code, amount, discount, payable }.
// The booking checks it again.
export function validateCoupon(code, booking) {
  return api.post('/portal/coupons/validate', { code, ...booking }).then((res) => res.data.data);
}

// payload: { vehicle, startDate, startTime, endDate, endTime, couponCode? }
export function createBooking(payload) {
  return api.post('/portal/trips', payload).then((res) => res.data);
}
