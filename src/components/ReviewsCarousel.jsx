import { useEffect, useRef, useState } from 'react';
import { fetchTestimonials } from '../api/portal';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, QuoteIcon, StarIcon } from './icons';

const ROTATE_MS = 5000;
const AVATAR_COLOURS = ['bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-600', 'bg-navy'];

// "Today", "3 days ago", or "Oct 2026" for older reviews.
function reviewedWhen(value) {
  const days = Math.floor((new Date() - new Date(value)) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(value).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function colourFor(name) {
  const sum = [...String(name)].reduce((n, ch) => n + ch.charCodeAt(0), 0);
  return AVATAR_COLOURS[sum % AVATAR_COLOURS.length];
}

// 1 card at a time on phones, 2 on tablets, 3 on desktops.
function usePerView() {
  const get = () => (typeof window === 'undefined' ? 1 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
  const [perView, setPerView] = useState(get);
  useEffect(() => {
    const onResize = () => setPerView(get());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return perView;
}

function ReviewCard({ review, hidden }) {
  return (
    <figure
      aria-hidden={hidden}
      className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-lg sm:p-7"
    >
      <div className="flex items-center justify-between">
        <span className="flex" aria-label={`${review.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <StarIcon key={n} className={`h-5 w-5 ${n <= review.rating ? 'text-amber-400' : 'text-slate-200'}`} />
          ))}
        </span>
        <QuoteIcon className="h-8 w-8 text-blue-100" />
      </div>
      <blockquote className="mt-4 line-clamp-6 flex-1 text-[0.95rem] leading-relaxed text-slate-700">&ldquo;{review.text}&rdquo;</blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
        <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${colourFor(review.name)}`}>
          {review.name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 font-bold text-slate-900">
            <span className="truncate">{review.name}</span>
            {/* Reviews customers wrote after a trip on the site (ratedAt) — not slides typed in by our team. */}
            {review.ratedAt && (
              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white" title="Verified renter">
                <CheckIcon className="h-2.5 w-2.5" />
              </span>
            )}
          </span>
          <span className="block truncate text-xs text-slate-500">
            {[review.subtitle, review.carName && `Drove the ${review.carName}`, review.ratedAt && reviewedWhen(review.ratedAt)].filter(Boolean).join(' · ') ||
              'Roam Wheels customer'}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

// What our customers say — the 5 latest customer reviews, then any slides pinned in the admin portal's
// Home Carousel page (up to 7 in all). Shows 1–3 cards at a time and moves on by itself every few seconds;
// pauses while hovered or touched. Swipe or use the arrows/dots to move. Renders nothing until there's a review.
export default function ReviewsCarousel({ className = '' }) {
  const [slides, setSlides] = useState([]);
  const [position, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const perView = usePerView();
  const count = slides.length;
  const shown = Math.min(perView, count);
  const positions = Math.max(count - shown + 1, 1);
  // Kept valid when the screen size (cards per view) changes.
  const index = Math.min(position, positions - 1);

  useEffect(() => {
    fetchTestimonials()
      .then(setSlides)
      .catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (positions < 2 || paused) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setInterval(() => setIndex((i) => (Math.min(i, positions - 1) + 1) % positions), ROTATE_MS);
    return () => clearInterval(timer);
  }, [positions, paused]);

  if (!count) return null;
  const go = (delta) => setIndex((i) => (Math.min(i, positions - 1) + delta + positions) % positions);

  return (
    <section id="reviews" className={`scroll-mt-24 bg-gradient-to-b from-white to-blue-50/70 px-4 py-14 sm:px-6 sm:py-20 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Reviews</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              What Our <span className="text-blue-600">Customers Say</span>
            </h2>
            <p className="mt-2 text-sm text-slate-500">The latest reviews from people who rented with us in Bengaluru.</p>
          </div>
          {positions > 1 && (
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous reviews"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-navy hover:text-white"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next reviews"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-navy text-white shadow-sm transition-colors hover:bg-ink"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div
          className="mt-8 overflow-hidden sm:mt-10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => {
            setPaused(true);
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current !== null) {
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            }
            touchX.current = null;
            setPaused(false);
          }}
        >
          <ul className="-mx-2.5 flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${(index * 100) / shown}%)` }}>
            {slides.map((s, i) => (
              <li key={s._id} className="flex-shrink-0 px-2.5 pb-2" style={{ width: `${100 / shown}%` }}>
                <ReviewCard review={s} hidden={i < index || i >= index + shown} />
              </li>
            ))}
          </ul>
        </div>

        {positions > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: positions }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show reviews ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`h-2 cursor-pointer rounded-full transition-all ${i === index ? 'w-7 bg-navy' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
