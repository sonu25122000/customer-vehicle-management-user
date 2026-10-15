import { useEffect, useRef, useState } from 'react';
import { fetchTestimonials } from '../api/portal';
import { ChevronLeftIcon, ChevronRightIcon, QuoteIcon, StarIcon } from './icons';

const ROTATE_MS = 5000;

// "Today", "3 days ago", or "Oct 2026" for older reviews.
function reviewedWhen(value) {
  const days = Math.floor((new Date() - new Date(value)) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(value).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function Stars({ value }) {
  return (
    <span className="flex" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={`h-4 w-4 ${n <= value ? 'text-amber-400' : 'text-slate-200'}`} />
      ))}
    </span>
  );
}

// What our customers say — the 5 latest customer reviews, then any slides pinned in the admin portal's
// Home Carousel page (up to 7 in all), rotating on their own every few seconds. Pauses while hovered or touched; swipe or use the arrows/dots to move.
// Renders nothing until there's at least one review.
export default function ReviewsCarousel({ className = '' }) {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const count = slides.length;

  useEffect(() => {
    fetchTestimonials()
      .then(setSlides)
      .catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  if (!count) return null;
  const go = (delta) => setIndex((i) => (i + delta + count) % count);

  return (
    <section id="reviews" className={`scroll-mt-24 bg-gradient-to-b from-white to-blue-50/60 px-4 py-14 sm:px-6 sm:py-20 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Reviews</p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          What Our <span className="text-blue-600">Customers Say</span>
        </h2>

        <div
          className="relative mt-8 sm:mt-10"
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
          <div className="overflow-hidden rounded-3xl">
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
              {slides.map((s, i) => (
                <figure
                  key={s._id}
                  aria-hidden={i !== index}
                  className="flex w-full flex-shrink-0 flex-col items-center gap-4 rounded-3xl bg-white px-6 py-8 shadow-sm ring-1 ring-slate-200 sm:px-14 sm:py-10"
                >
                  <QuoteIcon className="h-9 w-9 text-blue-100" />
                  <Stars value={s.rating} />
                  <blockquote className="max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg">&ldquo;{s.text}&rdquo;</blockquote>
                  <figcaption className="flex flex-col items-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                      {s.name.trim().charAt(0).toUpperCase()}
                    </span>
                    <span className="mt-2 font-bold text-slate-900">{s.name}</span>
                    {(s.subtitle || s.carName || s.ratedAt) && (
                      <span className="text-xs text-slate-500">
                        {[s.subtitle, s.carName && `Drove the ${s.carName}`, s.ratedAt && reviewedWhen(s.ratedAt)].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous review"
                className="absolute -left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-slate-700 shadow-md ring-1 ring-slate-200 hover:text-blue-600 sm:flex md:-left-5"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next review"
                className="absolute -right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-slate-700 shadow-md ring-1 ring-slate-200 hover:text-blue-600 sm:flex md:-right-5"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              <div className="mt-5 flex justify-center gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s._id}
                    type="button"
                    aria-label={`Show review ${i + 1}`}
                    aria-current={i === index}
                    onClick={() => setIndex(i)}
                    className={`h-2 cursor-pointer rounded-full transition-all ${i === index ? 'w-7 bg-navy' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
