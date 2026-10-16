import { SERVICE_AREA } from './site';

// A car's parking location (set by our team in the admin portal): { address, lat, lng }.

// The address to show, falling back to our service area when none was entered.
export function parkingArea(location) {
  return location?.address?.trim() || SERVICE_AREA;
}

export function hasPin(location) {
  return Number.isFinite(location?.lat) && Number.isFinite(location?.lng);
}

// Google Maps link: the exact pin when there is one, otherwise a search for the address.
export function mapsLink(location) {
  if (hasPin(location)) return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parkingArea(location))}`;
}

// Embeddable map (no API key needed) for the car page.
export function mapsEmbedUrl(location) {
  const q = hasPin(location) ? `${location.lat},${location.lng}` : encodeURIComponent(parkingArea(location));
  return `https://maps.google.com/maps?q=${q}&z=15&output=embed`;
}
