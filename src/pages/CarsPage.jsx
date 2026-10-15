import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchVehicles } from '../api/portal';
import CarCard from '../components/CarCard';
import OffersStrip from '../components/OffersStrip';
import EnquiryBar from '../components/EnquiryBar';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { CarIcon, SearchIcon, XIcon, FilterIcon, ListIcon, GridIcon } from '../components/icons';

const SORTS = [
  { key: 'popular', label: 'Top rated' },
  { key: 'priceLow', label: 'Price: low to high' },
  { key: 'priceHigh', label: 'Price: high to low' },
  { key: 'newest', label: 'Newest model' },
];
const FILTER_GROUPS = [
  { key: 'vehicleCategory', label: 'Segment' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'vehicleType', label: 'Type' },
];
const EMPTY_FILTERS = Object.fromEntries(FILTER_GROUPS.map((g) => [g.key, []]));

function sortCars(cars, sort) {
  const price = (c) => c.pricePerDay || Number.POSITIVE_INFINITY;
  const list = [...cars];
  if (sort === 'priceLow') list.sort((a, b) => price(a) - price(b));
  else if (sort === 'priceHigh') list.sort((a, b) => (b.pricePerDay || 0) - (a.pricePerDay || 0));
  else if (sort === 'newest') list.sort((a, b) => (b.year || 0) - (a.year || 0));
  else list.sort((a, b) => (b.rating?.avg || 0) - (a.rating?.avg || 0) || (b.rating?.count || 0) - (a.rating?.count || 0));
  return list;
}

function FilterPanel({ cars, filters, setFilters }) {
  const activeCount = Object.values(filters).flat().length;
  const hasChoices = FILTER_GROUPS.some((g) => new Set(cars.map((c) => c[g.key]).filter(Boolean)).size > 1);
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-base font-bold text-navy">
          <FilterIcon className="h-5 w-5" /> Filter
        </p>
        {activeCount > 0 && (
          <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="cursor-pointer text-sm font-semibold text-blue-600 hover:underline">
            Clear all
          </button>
        )}
      </div>
      {!hasChoices && !activeCount && <p className="mt-3 text-sm text-slate-500">Filters appear here once there are more cars to choose between.</p>}
      {FILTER_GROUPS.map((group) => {
        const options = [...new Set(cars.map((c) => c[group.key]).filter(Boolean))].sort();
        if (options.length < 2 && !filters[group.key].length) return null;
        return (
          <fieldset key={group.key} className="mt-5">
            <legend className="text-sm font-bold text-slate-900">{group.label}</legend>
            <div className="mt-2 flex flex-col gap-1">
              {options.map((opt) => {
                const checked = filters[group.key].includes(opt);
                const count = cars.filter((c) => c[group.key] === opt).length;
                return (
                  <label key={opt} className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setFilters((f) => ({
                          ...f,
                          [group.key]: checked ? f[group.key].filter((v) => v !== opt) : [...f[group.key], opt],
                        }))
                      }
                      className="h-4.5 w-4.5 cursor-pointer rounded border-slate-300 text-navy focus:ring-blue-500"
                    />
                    <span className="flex-1 uppercase tracking-wide">{opt}</span>
                    <span className="text-xs text-slate-400">{count}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

// Our cars — open to everyone, no login needed. The search box is kept in the URL (?q=) so a search can
// be shared or come straight from the home page; the side filters, sort and list/grid view work on the
// cars that search returned.
export default function CarsPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const [input, setInput] = useState(query);
  // The last finished search: still loading while it's for a different query than the URL's.
  const [result, setResult] = useState({ query: null, cars: [], failed: false });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('popular');
  const [view, setView] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
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

  const visible = useMemo(() => {
    if (!cars) return null;
    const filtered = cars.filter((c) => FILTER_GROUPS.every((g) => !filters[g.key].length || filters[g.key].includes(c[g.key])));
    return sortCars(filtered, sort);
  }, [cars, filters, sort]);
  const activeFilters = Object.values(filters).flat().length;

  return (
    <div className="pb-24">
      {/* Dates band (Mychoize-style): pick dates once, every "Enquire" on this page uses them. */}
      <div className="border-b border-slate-200 bg-[#e9edf6]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <EnquiryBar />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-navy sm:text-2xl">Our Cars</h1>
            <p className="text-sm text-slate-500">Found one you like? Enquire on WhatsApp with your dates and we&apos;ll set it up for you.</p>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search make, model, type or fuel"
              aria-label="Search cars"
              className="w-full rounded-full border border-slate-300 bg-white py-2.5 pl-11 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            {input && (
              <button
                type="button"
                onClick={() => {
                  setInput('');
                  setParams({});
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <OffersStrip className="mt-6" />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="lg:sticky lg:top-28">{cars && <FilterPanel cars={cars} filters={filters} setFilters={setFilters} />}</div>
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <p className="mr-auto rounded-lg bg-slate-200/70 px-3.5 py-2 text-sm font-medium text-slate-700">
                {visible ? `${visible.length} car${visible.length === 1 ? '' : 's'} available` : 'Loading cars…'}
                {query && ` for "${query}"`}
              </p>
              <button
                type="button"
                onClick={() => setShowFilters((s) => !s)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 lg:hidden"
              >
                <FilterIcon className="h-4 w-4" /> Filters{activeFilters ? ` (${activeFilters})` : ''}
              </button>
              <label className="flex items-center gap-2 text-sm text-slate-500">
                <span className="hidden sm:inline">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="cursor-pointer rounded-lg bg-white px-3 py-2 text-sm font-semibold text-navy ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="hidden overflow-hidden rounded-lg bg-white ring-1 ring-slate-200 sm:flex">
                {[
                  { key: 'list', icon: ListIcon, label: 'List view' },
                  { key: 'grid', icon: GridIcon, label: 'Grid view' },
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setView(key)}
                    aria-label={label}
                    aria-pressed={view === key}
                    className={`cursor-pointer px-3 py-2 ${view === key ? 'bg-navy text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </button>
                ))}
              </div>
            </div>

            {visible === null ? (
              <div className="grid grid-cols-1 gap-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-56 animate-pulse rounded-2xl bg-white" />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <CarIcon className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-700">
                  {failed ? 'Could not load cars right now' : query || activeFilters ? 'No cars match your search' : 'No cars available right now'}
                </p>
                <p className="mt-1 text-sm text-slate-500">Tell us what you need and we&apos;ll find you a ride.</p>
                <WhatsAppButton className="mt-5" message={`Hi Roam Wheels! I'm looking for a car${query ? ` (${query})` : ''}.`} />
              </div>
            ) : (
              <div className={`grid grid-cols-1 gap-5 ${view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : ''}`}>
                {visible.map((car) => (
                  <CarCard key={car._id} car={car} layout={view} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
