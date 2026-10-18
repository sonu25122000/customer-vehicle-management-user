import { SUPPORT_PHONE, phoneLink, formatPhone } from '../utils/contact';
import { PhoneIcon } from './icons';

// "Call" — the outlined navy partner of the orange Book Now / WhatsApp buttons. Hidden when no phone
// number is configured.
export default function CallButton({ label = 'Call', className = '' }) {
  if (!SUPPORT_PHONE) return null;
  return (
    <a
      href={phoneLink()}
      aria-label={`Call us on ${formatPhone()}`}
      className={`inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-full border-2 border-primary bg-white px-5 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white ${className}`}
    >
      <PhoneIcon className="h-4 w-4" /> {label}
    </a>
  );
}
