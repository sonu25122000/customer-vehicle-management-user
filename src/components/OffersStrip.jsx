import { useEffect, useState } from 'react';
import { fetchOffers } from '../api/portal';
import { formatMoney } from '../utils/format';
import { TagIcon } from './icons';

// Expiry is an exact moment (not a calendar date like trip dates), so show it in the visitor's own timezone.
function formatExpiry(value) {
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function offerText(o) {
  if (o.discountType === 'percentage') {
    return `${o.value}% off${o.maxDiscount ? ` (up to ${formatMoney(o.maxDiscount)})` : ''}`;
  }
  return `${formatMoney(o.value)} off`;
}

// Coupons the team marked "Publicly visible" in the admin portal. Renders nothing when there are none.
export default function OffersStrip({ className = '' }) {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    fetchOffers()
      .then(setOffers)
      .catch(() => setOffers([]));
  }, []);

  if (!offers.length) return null;

  return (
    <section className={className}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <TagIcon className="h-4 w-4 text-accent-600" />
        <h2 className="text-base font-extrabold text-primary">Offers for you</h2>
        <span className="text-xs text-slate-500">Mention the code when you book.</span>
      </div>
      <div className="no-scrollbar -mx-4 mt-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2.5 sm:w-auto sm:flex-wrap">
          {offers.map((o) => {
            const details = [o.note, o.minBookingAmount ? `Min. booking ${formatMoney(o.minBookingAmount)}` : ''].filter(Boolean).join(' · ');
            const limit = o.perCustomerLimit ? (o.perCustomerLimit === 1 ? ' · once per guest' : ` · ${o.perCustomerLimit} uses per guest`) : '';
            return (
              <div key={o._id} className="w-56 flex-shrink-0 rounded-xl border border-dashed border-accent-300 bg-accent-50/60 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-extrabold text-accent-700">{offerText(o)}</p>
                  <span className="flex-shrink-0 rounded bg-white px-1.5 py-0.5 font-mono text-[0.7rem] font-bold tracking-wider text-slate-800 ring-1 ring-slate-200">
                    {o.code}
                  </span>
                </div>
                {details && (
                  <p className="mt-1 truncate text-[0.7rem] font-medium text-slate-600" title={details}>
                    {details}
                  </p>
                )}
                <p className="mt-0.5 text-[0.65rem] text-slate-400">
                  Valid till {formatExpiry(o.expiresAt)}
                  {limit}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
