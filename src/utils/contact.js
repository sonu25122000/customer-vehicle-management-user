// Business contact details. The phone number is set here, in one place, for every Call and WhatsApp
// button on the site — change it here and push.
const BUSINESS_PHONE = '9241691016';

// WhatsApp: digits with the 91 country code, no +.
export const WHATSAPP_NUMBER = `91${BUSINESS_PHONE}`;

// The number to call.
export const SUPPORT_PHONE = BUSINESS_PHONE;
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

// "9241691016" -> "+91 92416 91016"
export function formatPhone(phone = SUPPORT_PHONE) {
  const digits = String(phone || '').replace(/\D/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return local.length === 10 ? `+91 ${local.slice(0, 5)} ${local.slice(5)}` : phone;
}
