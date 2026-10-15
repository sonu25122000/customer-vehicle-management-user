// Business contact details, from .env (see .env.example).
export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');

// The number to call. Defaults to the WhatsApp number (without the 91 country code) when no separate
// support number is set.
export const SUPPORT_PHONE =
  import.meta.env.VITE_SUPPORT_PHONE || (WHATSAPP_NUMBER.length === 12 && WHATSAPP_NUMBER.startsWith('91') ? WHATSAPP_NUMBER.slice(2) : WHATSAPP_NUMBER);
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || '';

export const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/roam_wheels';
export const INSTAGRAM_HANDLE = `@${INSTAGRAM_URL.replace(/\/+$/, '').split('/').pop()}`;

export const DEFAULT_WHATSAPP_MESSAGE = "Hi Roam Wheels! I'd like to book a car.";

// wa.me link with the message pre-filled. Without a configured number, WhatsApp asks which chat to open.
export function whatsappLink(message = DEFAULT_WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// tel: link, assuming an Indian number when no country code is given.
export function phoneLink(phone = SUPPORT_PHONE) {
  const digits = String(phone || '').replace(/\D/g, '');
  return `tel:${digits.length === 10 ? `+91${digits}` : `+${digits}`}`;
}

// "9955074864" -> "+91 99550 74864"
export function formatPhone(phone = SUPPORT_PHONE) {
  const digits = String(phone || '').replace(/\D/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return local.length === 10 ? `+91 ${local.slice(0, 5)} ${local.slice(5)}` : phone;
}
