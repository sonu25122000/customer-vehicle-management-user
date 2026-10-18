import { useEffect, useState, useSyncExternalStore } from 'react';
import { isLoading, subscribeLoading } from '../utils/loading';

// The animated RoamWheels logo (public/loader.gif, on its own dark navy background #010814).
const LOADER_BG = '#010814';
// Quick responses don't flash the loader; once shown it stays long enough to read as intentional.
const SHOW_AFTER_MS = 200;
const MIN_VISIBLE_MS = 500;

export function LoaderLogo({ className = 'w-40' }) {
  return <img src="/loader.gif" alt="Loading" width="340" height="200" className={`h-auto ${className}`} />;
}

// Full screen, while the site starts (same look as the loader in index.html).
export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background: LOADER_BG }} role="status" aria-live="polite">
      <LoaderLogo className="w-[170px]" />
    </div>
  );
}

// Whenever the site is waiting for the server (a page loading its data, a form being sent...), the logo
// shows in a dark card over the page. Requests made with { silent: true } don't trigger it.
export function ApiLoader() {
  const loading = useSyncExternalStore(subscribeLoading, isLoading);
  const [visible, setVisible] = useState(false);
  const [shownAt, setShownAt] = useState(0);

  useEffect(() => {
    if (loading && !visible) {
      const timer = setTimeout(() => {
        setVisible(true);
        setShownAt(Date.now());
      }, SHOW_AFTER_MS);
      return () => clearTimeout(timer);
    }
    if (!loading && visible) {
      const timer = setTimeout(() => setVisible(false), Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt)));
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [loading, visible, shownAt]);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-white/55 backdrop-blur-[2px]" role="status" aria-live="polite">
      <div className="rounded-3xl px-5 py-4 shadow-2xl shadow-primary/40" style={{ background: LOADER_BG }}>
        <LoaderLogo className="w-36 sm:w-40" />
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
