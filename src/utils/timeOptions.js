// Half-hour interval time-of-day options for trip start/end time pickers. The native
// <input type="time" step="1800"> approach doesn't reliably restrict the browser's own
// picker UI to 30-minute increments (Chrome's flyout still scrolls through every minute),
// so this is a plain dropdown instead — value stays "HH:mm" to match the existing backend format.
export const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  const value = `${String(hours).padStart(2, '0')}:${minutes}`;
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return { value, label: `${String(displayHour).padStart(2, '0')}:${minutes} ${period}` };
});

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Pick-up slots for a date: on today's date only slots at least 30 minutes from now; none for past dates.
export function startTimeOptions(date) {
  const today = todayIso();
  if (date < today) return [];
  if (date > today) return TIME_OPTIONS;
  const now = new Date();
  const minMinutes = now.getHours() * 60 + now.getMinutes() + 30;
  return TIME_OPTIONS.filter((t) => {
    const [h, m] = t.value.split(':').map(Number);
    return h * 60 + m >= minMinutes;
  });
}

// Return slots: after the pick-up time when returning the same day; none before the pick-up date.
export function endTimeOptions(dates) {
  if (dates.endDate < dates.startDate) return [];
  if (dates.endDate === dates.startDate) return TIME_OPTIONS.filter((t) => t.value > dates.startTime);
  return TIME_OPTIONS;
}
