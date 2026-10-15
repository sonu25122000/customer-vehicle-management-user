export function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// "HH:mm" -> "10:30 AM"
export function formatTime(value) {
  if (!value) return '';
  const [h, m] = value.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

// Local calendar date as 'YYYY-MM-DD', offset by `days`.
export function isoDate(days = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Same rule as the backend (portalController.rentalDays): every started 24 hours counts as a day, minimum one.
export function rentalDays(startDate, startTime, endDate, endTime) {
  const start = new Date(`${startDate}T${startTime}:00`);
  const end = new Date(`${endDate}T${endTime}:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return 0;
  return Math.max(1, Math.ceil((end - start) / (24 * 60 * 60 * 1000)));
}

export function vehicleName(v) {
  if (!v) return '';
  return [v.make, v.model].filter(Boolean).join(' ');
}
