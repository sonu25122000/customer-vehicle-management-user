import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Every page opens at the top. Without this the browser keeps the previous page's scroll position on
// in-app navigation (e.g. tapping a car low on the home page opened the car's page scrolled down).
// - Back/forward (POP) is left to the browser, so returning to a list keeps your place.
// - Links to a section (/#faq) scroll to that section instead.
export function useScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType === 'POP') return;
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
      return;
    }
    // 'instant': the site sets scroll-behavior: smooth, which would otherwise animate from the bottom.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Only a new page or section — not ?q= changes, which the Cars page makes while you type a search.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash]);
}
