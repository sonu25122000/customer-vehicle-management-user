// Google Analytics 4 (gtag.js). Loaded only when VITE_GA_MEASUREMENT_ID is set (e.g. G-XXXXXXXXXX), so
// local development and preview builds don't send data. This is a single-page app, so page views are
// sent on every route change (usePageViews) instead of relying on full page loads.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

let initialized = false;

export function initAnalytics() {
  if (!MEASUREMENT_ID || initialized || typeof window === 'undefined') return;
  initialized = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  // Page views are sent by usePageViews.
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });
}

export function trackEvent(name, params = {}) {
  if (MEASUREMENT_ID && window.gtag) window.gtag('event', name, params);
}

export function usePageViews() {
  const location = useLocation();
  useEffect(() => {
    if (!MEASUREMENT_ID || !window.gtag) return;
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);
}
