import { useEffect, useRef, useState } from 'react';
import { fetchOffers } from '../api/portal';
import { formatMoney } from '../utils/format';
import { ChevronLeftIcon, ChevronRightIcon, TagIcon } from './icons';

// Expiry is an exact moment (not a calendar date like trip dates), so show it in the visitor's own timezone.
function formatExpiry(value) {
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// The big figure on the ticket's stub: "₹500" or "20%".
function discountFigure(o) {
  return o.discountType === 'percentage' ? `${o.value}%` : formatMoney(o.value);
}

// Everything else about the offer, in full: cap, note, minimum booking, usage limit.
function offerDetails(o) {
  return [
    o.discountType === 'percentage' && o.maxDiscount ? `Up to ${formatMoney(o.maxDiscount)}` : '',
    o.note,
    o.minBookingAmount ? `Min. booking ${formatMoney(o.minBookingAmount)}` : '',
    o.perCustomerLimit ? (o.perCustomerLimit === 1 ? 'Once per guest' : `${o.perCustomerLimit} uses per guest`) : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

// Coupons the team marked "Publicly visible" in the admin portal, as coupon tickets in a single row that
// scrolls sideways — the section stays one ticket tall however many offers there are. Nothing is cut
// off: each ticket shows its whole code and details. Renders nothing when there are no offers.
export default function OffersStrip({ className = '' }) {
  const [offers, setOffers] = useState([]);
  const rowRef = useRef(null);
  const [scroll, setScroll] = useState({ left: false, right: false });

  useEffect(() => {
    fetchOffers()
      .then(setOffers)
      .catch(() => setOffers([]));
  }, []);

  // Arrows only when there's more to see in that direction.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;
    const update = () => setScroll({ left: row.scrollLeft > 4, right: row.scrollLeft + row.clientWidth < row.scrollWidth - 4 });
    update();
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      row.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [offers]);

  if (!offers.length) return null;

  const scrollBy = (direction) => rowRef.current?.scrollBy({ left: direction * 300, behavior: 'smooth' });
  const arrowClass =
    'absolute top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-primary shadow-md ring-1 ring-slate-200 transition-colors hover:bg-accent-50 sm:flex';

  return (
    <section className={className} aria-label="Offers">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <TagIcon className="h-4 w-4 text-accent-600" />
        <h2 className="text-base font-extrabold text-primary">Offers for you</h2>
        <span className="text-xs text-slate-500">Mention the code when you book.</span>
      </div>

      <div className="relative mt-2">
        {scroll.left && (
          <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous offers" className={`${arrowClass} -left-3`}>
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        )}
        <div ref={rowRef} className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0">
          {offers.map((o) => {
            const details = offerDetails(o);
            return (
              <div key={o._id} className="flex w-72 flex-shrink-0 snap-start overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-accent-200">
                {/* Stub: the discount */}
                <div className="flex w-[4.75rem] flex-shrink-0 flex-col items-center justify-center bg-accent px-1.5 py-2 text-center text-primary">
                  <span className="text-lg font-extrabold leading-none">{discountFigure(o)}</span>
                  <span className="mt-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.2em]">Off</span>
                </div>
                {/* Perforation */}
                <div className="relative w-0 border-l-2 border-dashed border-accent-200">
                  <span className="absolute -left-[7px] -top-1.5 h-3 w-3 rounded-full bg-slate-50 ring-1 ring-accent-200" />
                  <span className="absolute -bottom-1.5 -left-[7px] h-3 w-3 rounded-full bg-slate-50 ring-1 ring-accent-200" />
                </div>
                {/* Code + details */}
                <div className="min-w-0 flex-1 px-3 py-2">
                  <p className="break-all font-mono text-sm font-extrabold tracking-wider text-primary">{o.code}</p>
                  {details && <p className="mt-0.5 text-[0.7rem] leading-snug text-slate-600">{details}</p>}
                  <p className="mt-0.5 text-[0.65rem] text-slate-400">Valid till {formatExpiry(o.expiresAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
        {scroll.right && (
          <button type="button" onClick={() => scrollBy(1)} aria-label="More offers" className={`${arrowClass} -right-3`}>
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </section>
  );
}
