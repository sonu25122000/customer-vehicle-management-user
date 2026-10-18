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
      <div className="flex items-center gap-2">
        <TagIcon className="h-5 w-5 text-accent-600" />
        <h2 className="text-lg font-extrabold text-primary sm:text-xl">Offers for you</h2>
      </div>
      <div className="no-scrollbar -mx-4 mt-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-3 sm:w-auto sm:flex-wrap">
          {offers.map((o) => (
            <div
              key={o._id}
              className="relative w-64 flex-shrink-0 overflow-hidden rounded-2xl border border-dashed border-accent-300 bg-gradient-to-br from-accent-50 to-white p-4"
            >
              <p className="text-xl font-extrabold text-accent-700">{offerText(o)}</p>
              <p className="mt-2 inline-block rounded-md bg-white px-2.5 py-1 font-mono text-sm font-bold tracking-wider text-slate-800 ring-1 ring-slate-200">
                {o.code}
              </p>
              {o.note && <p className="mt-2 text-xs font-medium text-slate-700">{o.note}</p>}
              {o.minBookingAmount ? (
                <p className="mt-1 text-xs font-semibold text-slate-600">On a minimum booking of {formatMoney(o.minBookingAmount)}</p>
              ) : null}
              <p className="mt-2 text-xs text-slate-500">
                Valid till {formatExpiry(o.expiresAt)}
                {o.forYou && <span className="ml-1.5 font-semibold text-accent-700">· Just for you</span>}
                {o.perCustomerLimit ? (
                  <span className="ml-1.5">· {o.perCustomerLimit === 1 ? 'Once per customer' : `${o.perCustomerLimit} uses per customer`}</span>
                ) : null}
              </p>
              <p className="mt-1 text-[0.7rem] text-slate-400">Mention the code when you book with us.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
