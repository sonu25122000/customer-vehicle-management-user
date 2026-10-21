import { useEffect, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import Modal from './Modal';
import EnquiryBar from './EnquiryBar';
import PricingNote from './PricingNote';

// The "Book the <car>" pop-up (dates -> WhatsApp). It lives once at the top of the app (EnquiryModalHost
// in App.jsx), not inside a car card: changing the dates reloads the car lists (they only show cars free
// for those dates), and a pop-up inside a card would vanish with it. Here it stays open and shows the
// new dates. Car cards open it with openEnquiry(carName).

let current = null; // the car's name while open
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

export function openEnquiry(carName) {
  current = carName;
  emit();
}

export function closeEnquiry() {
  current = null;
  emit();
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function EnquiryModalHost() {
  const carName = useSyncExternalStore(subscribe, () => current);
  const { pathname } = useLocation();

  // Going to another page closes it.
  useEffect(() => {
    closeEnquiry();
  }, [pathname]);

  if (!carName) return null;
  return (
    <Modal title={`Book the ${carName}`} onClose={closeEnquiry}>
      <p className="mb-4 text-sm text-slate-500">Pick your dates — we&apos;ll open WhatsApp with them filled in.</p>
      <EnquiryBar carName={carName} compact />
      <PricingNote className="mt-4" />
    </Modal>
  );
}
