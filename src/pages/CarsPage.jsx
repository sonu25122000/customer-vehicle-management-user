import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchVehicles } from '../api/portal';
import CarCard from '../components/CarCard';
import OffersStrip from '../components/OffersStrip';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CarIcon, SearchIcon, XIcon } from '../components/icons';

const QUICK_FILTERS = ['SUV', 'Sedan', 'Hatchback', 'Automatic', 'Diesel', 'Electric'];

// Our cars — open to everyone, no login needed. The search box is kept in the URL (?q=) so a search
// can be shared or come straight from the home page.
export default function CarsPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const [input, setInput] = useState(query);
  // The last finished search: still loading while it's for a different query than the URL's.
  const [result, setResult] = useState({ query: null, cars: [], failed: false });
  const cars = result.query === query ? result.cars : null;
  const failed = result.query === query && result.failed;

  // Debounce typing into the URL.
  useEffect(() => {
    if (input.trim() === query) return undefined;
    const timer = setTimeout(() => setParams(input.trim() ? { q: input.trim() } : {}, { replace: true }), 350);
    return () => clearTimeout(timer);
  }, [input, query, setParams]);

  useEffect(() => {
    let cancelled = false;
    fetchVehicles({ search: query || undefined })
      .then((list) => !cancelled && setResult({ query, cars: list, failed: false }))
      .catch(() => !cancelled && setResult({ query, cars: [], failed: true }));
    return () => {
      cancelled = true;
    };
  }, [query]);

  function applyQuery(q) {
    setInput(q);
    setParams(q ? { q } : {});
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Our Cars</h1>
        <p className="text-sm text-slate-500">Browse our fleet. Found one you like? Message us on WhatsApp and we&apos;ll set it up for you.</p>
      </div>

      <div className="relative mt-5 max-w-xl">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by make, model, type or fuel (e.g. Swift, SUV, diesel)"
          aria-label="Search cars"
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
        {input && (
          <button
            type="button"
            onClick={() => applyQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="no-scrollbar -mx-4 mt-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {QUICK_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => applyQuery(query.toLowerCase() === f.toLowerCase() ? '' : f)}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                query.toLowerCase() === f.toLowerCase() ? 'bg-navy text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <OffersStrip className="mt-8" />

      <div className="mt-8">
        {cars === null ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <CarIcon className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700">
              {failed ? 'Could not load cars right now' : query ? `No cars match "${query}"` : 'No cars available right now'}
            </p>
            <p className="mt-1 text-sm text-slate-500">Tell us what you need and we&apos;ll find you a ride.</p>
            <WhatsAppButton className="mt-5" message={`Hi Roam Wheels! I'm looking for a car${query ? ` (${query})` : ''}.`} />
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-500">
              {cars.length} car{cars.length === 1 ? '' : 's'}
              {query && ` matching "${query}"`}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
