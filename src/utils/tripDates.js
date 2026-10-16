import { useEffect, useState } from 'react';
import { isoDate } from './format';
import { startTimeOptions } from './timeOptions';

// The pick-up / return dates a visitor chose for a WhatsApp enquiry. Kept for the browser session, so
// dates picked on the home page are already filled in when they enquire about a car on another page.
const KEY = 'rw:tripDates';
const DAY_MS = 24 * 60 * 60 * 1000;

function defaults() {
  return { startDate: isoDate(1), startTime: '10:00', endDate: isoDate(2), endTime: '10:00' };
}

function load() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    // A pick-up that has already passed is no use for an enquiry.
    const startOk = saved?.startDate && startTimeOptions(saved.startDate).some((t) => t.value === saved.startTime);
    if (startOk && saved.endDate >= saved.startDate) return saved;
  } catch {
    // Storage unavailable (private mode etc.) — fall back to defaults.
  }
  return defaults();
}

const listeners = new Set();
let current = null;

export function useTripDates() {
  const [dates, setDatesState] = useState(() => {
    if (!current) current = load();
    return current;
  });

  useEffect(() => {
    listeners.add(setDatesState);
    return () => listeners.delete(setDatesState);
  }, []);

  function setDates(update) {
    current = typeof update === 'function' ? update(current) : update;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(current));
    } catch {
      // Not persisted — still works for this page.
    }
    listeners.forEach((fn) => fn(current));
  }

  return [dates, setDates];
}

// "3 days 4 hours" between two date+time picks, or '' when the end isn't after the start.
export function durationText({ startDate, startTime, endDate, endTime }) {
  const start = new Date(`${startDate}T${startTime}:00`);
  const end = new Date(`${endDate}T${endTime}:00`);
  const ms = end - start;
  if (!(ms > 0)) return '';
  const days = Math.floor(ms / DAY_MS);
  const hours = Math.round((ms - days * DAY_MS) / (60 * 60 * 1000));
  const parts = [];
  if (days) parts.push(`${days} day${days === 1 ? '' : 's'}`);
  if (hours) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  return parts.join(' ');
}
