import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from '../utils/contact';
import { trackEvent } from '../utils/analytics';
import { InstagramIcon, ArrowRightIcon, CarIcon, MapPinIcon, StarIcon } from './icons';
import heroImage from '../assets/login-hero.png';

const TILES = [
  { icon: CarIcon, label: 'New cars in the fleet' },
  { icon: MapPinIcon, label: 'Road-trip ideas' },
  { icon: StarIcon, label: 'Offers & giveaways' },
];

// Promotes the Instagram profile: a bold, brand-coloured banner with what followers get, and a
// single "Follow" call to action.
export default function InstagramSection() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-xl sm:p-10 lg:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/15" />
        <div className="pointer-events-none absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-white/10" />
        <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
              <InstagramIcon className="h-4 w-4" /> {INSTAGRAM_HANDLE}
            </span>
            <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-4xl">Follow the ride on Instagram</h2>
            <p className="mt-3 max-w-md text-sm text-white/90 sm:text-base">
              Our latest cars, weekend road-trip ideas, customer journeys and Instagram-only offers — all in one place.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {TILES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </li>
              ))}
            </ul>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('instagram_click', { location: 'home_section' })}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-primary shadow-lg shadow-accent/30 transition-transform hover:scale-[1.03]"
            >
              <InstagramIcon className="h-5 w-5" /> Follow {INSTAGRAM_HANDLE}
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>

          {/* A phone-shaped "post" preview — decorative. */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-hidden="true"
            tabIndex={-1}
            className="mx-auto hidden w-full max-w-xs rotate-3 overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl ring-8 ring-white/20 transition-transform hover:rotate-0 sm:block"
          >
            <div className="flex items-center gap-2.5 px-4 py-3">
              <span className="rounded-full bg-gradient-to-tr from-[#f77737] via-[#e1306c] to-[#833ab4] p-[2px]">
                <span className="block h-8 w-8 rounded-full bg-primary" />
              </span>
              <span className="text-sm font-bold">{INSTAGRAM_HANDLE.slice(1)}</span>
            </div>
            <div className="aspect-square bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
            <div className="px-4 py-3 text-left">
              <p className="text-sm">
                <span className="font-bold">{INSTAGRAM_HANDLE.slice(1)}</span> Your next journey starts here 🚗✨
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
