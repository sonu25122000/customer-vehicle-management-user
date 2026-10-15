// Business contact details, from .env (see .env.example).
export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');
export const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE || '';
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || '';

export const DEFAULT_WHATSAPP_MESSAGE = "Hi Roam Wheels! I'd like to book a car.";

// wa.me link with the message pre-filled. Without a configured number, WhatsApp asks which chat to open.
export function whatsappLink(message = DEFAULT_WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
