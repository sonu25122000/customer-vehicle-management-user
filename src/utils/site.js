// Business facts shown around the site. Edit these here — they aren't calculated from the data.

// We only rent cars in Bengaluru. The city picker on the home page offers just
// this one; add more here if that ever changes.
export const CITIES = [{ value: 'Bengaluru', label: 'Bengaluru' }];
export const DEFAULT_CITY = CITIES[0].value;
export const SERVICE_AREA = 'Bengaluru';

// Same as <title> in index.html — pages that set their own title put this back when they close.
export const DEFAULT_TITLE = 'Car Rental in Bengaluru | RoamWheels';

// The numbers band on the home page.
export const SITE_METRICS = [
  { value: '2 Lakh+', label: 'Kilometres driven' },
  { value: '200+', label: 'Guests served' },
  { value: '5.0', label: 'Average rating', star: true },
  { value: '0%', label: 'Cancellation rate' },
];
