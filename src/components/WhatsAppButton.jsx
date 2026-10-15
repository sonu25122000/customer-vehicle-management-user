import { whatsappLink } from '../utils/contact';
import { WhatsAppIcon, ArrowRightIcon } from './icons';

// Primary "Chat on WhatsApp" call to action (brand blue, like every other primary button on the site).
export function WhatsAppButton({ message, label = 'Chat on WhatsApp', className = '' }) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-700 ${className}`}
    >
      <WhatsAppIcon className="h-5 w-5" />
      {label}
      <ArrowRightIcon className="h-4 w-4" />
    </a>
  );
}

// Floating button shown on every page. `hideOnPhone`: pages with a bottom action bar on phones
// (booking) would have it covering their main button.
export function WhatsAppFab({ hideOnPhone = false }) {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className={`${hideOnPhone ? 'hidden sm:flex' : 'flex'} fixed bottom-4 right-4 z-40 h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-900/30 ring-4 ring-white transition-transform hover:scale-105 hover:bg-blue-700 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14`}
    >
      <WhatsAppIcon className="h-6 w-6 sm:h-7 sm:w-7" />
    </a>
  );
}
