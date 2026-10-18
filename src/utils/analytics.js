// Google Analytics 4. The Google tag itself (gtag.js, G-XJFYTYEP97) is in index.html, right after
// <head>, as Google asks — it records the first page view when the site loads. This is a single-page
// app, so moving between pages doesn't reload it: usePageViews sends a page view on every later route
// change, and trackEvent sends custom events (e.g. WhatsApp enquiries).
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function trackEvent(name, params = {}) {
  if (typeof window !== 'undefined' && window.gtag) window.gtag('event', name, params);
}

export function usePageViews() {
  const location = useLocation();
  const first = useRef(true);
  useEffect(() => {
    // The tag's own config call already counted the page the visitor landed on.
    if (first.current) {
      first.current = false;
      return;
    }
    trackEvent('page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);
}
