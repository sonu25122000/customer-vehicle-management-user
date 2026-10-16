import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  LogoutIcon,
  MenuIcon,
  XIcon,
  PhoneIcon,
  HomeIcon,
  CarIcon,
  RouteIcon,
  IdCardIcon,
  UserIcon,
  StarIcon,
  SparkIcon,
  HeadsetIcon,
  ChevronRightIcon,
} from './icons';
import logo from '../assets/logo.png';
import { BOOKING_ENABLED } from '../utils/features';
import { SUPPORT_PHONE, phoneLink, formatPhone } from '../utils/contact';
import { profilePhotoUrl } from '../api/portal';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? 'text-accent-600' : 'text-slate-700 hover:text-accent-600'}`;

const drawerLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-3 text-[0.95rem] font-semibold transition-colors ${
    isActive ? 'bg-accent-50 text-accent-700' : 'text-primary hover:bg-slate-50'
  }`;

function Avatar({ customer, className }) {
  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-light to-primary-dark font-bold text-white ${className}`}
    >
      {customer.photoVersion ? (
        <img src={profilePhotoUrl(customer.photoVersion)} alt="" className="h-full w-full object-cover" />
      ) : (
        customer.name?.trim().charAt(0).toUpperCase()
      )}
    </span>
  );
}

// `overlay` = sits on top of the home page hero (no background of its own).
// On phones the call button and "Login / Signup" stay in the bar itself; the page links open in a
// panel that slides in from the right.
export default function Navbar({ overlay = false }) {
  const { customer, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);

  // While the menu is open: no page scrolling behind it, and Escape closes it.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    // Go home first: logging out on a members-only page would otherwise bounce to the login page.
    navigate('/', { replace: true });
    await logout();
    toast.success('Logged out');
  }

  const homeLink = { to: '/', label: 'Home', end: true, icon: HomeIcon };
  const links = customer
    ? [
        homeLink,
        ...(BOOKING_ENABLED ? [{ to: '/book', label: 'Book a Car', icon: CarIcon }] : []),
        { to: '/trips', label: 'My Trips', icon: RouteIcon },
        { to: '/documents', label: 'Documents', icon: IdCardIcon },
        { to: '/profile', label: 'Profile', icon: UserIcon },
      ]
    : [
        homeLink,
        { to: '/#reviews', label: 'Reviews', hash: true, icon: StarIcon },
        { to: '/#faq', label: "FAQ's", hash: true, icon: SparkIcon },
        { to: '/#contact', label: 'Contact Us', hash: true, icon: HeadsetIcon },
      ];

  // Rendered into <body>: the sticky header's backdrop blur would otherwise trap the fixed panel inside it.
  const drawer = createPortal(
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} inert={!open}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-primary-dark/50 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute inset-y-0 right-0 flex w-[84%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <Link to="/" onClick={close}>
            <img src={logo} alt="Roam Wheels" className="h-10 w-auto" />
          </Link>
          <button onClick={close} aria-label="Close menu" className="cursor-pointer rounded-full p-2 text-slate-600 hover:bg-slate-100">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {customer && (
            <Link to="/profile" onClick={close} className="mb-4 flex items-center gap-3 rounded-2xl bg-primary p-3.5 text-white">
              <Avatar customer={customer} className="h-11 w-11 text-base ring-2 ring-white/30" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">Hi, {customer.name?.split(' ')[0]}</span>
                <span className="block text-xs text-primary-200">View your profile</span>
              </span>
              <ChevronRightIcon className="h-4 w-4 text-primary-200" />
            </Link>
          )}

          <nav className="flex flex-col gap-1">
            {links.map(({ icon: Icon, ...l }) =>
              l.hash ? (
                <a key={l.to} href={l.to} onClick={close} className={drawerLinkClass({ isActive: false })}>
                  <Icon className="h-5 w-5 text-accent-600" /> {l.label}
                </a>
              ) : (
                <NavLink key={l.to} to={l.to} end={l.end} onClick={close} className={drawerLinkClass}>
                  <Icon className="h-5 w-5 text-accent-600" /> {l.label}
                </NavLink>
              )
            )}
          </nav>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-slate-100 p-4">
          {SUPPORT_PHONE && (
            <a
              href={phoneLink()}
              className="flex items-center justify-center gap-2 rounded-full border-2 border-primary px-4 py-2.5 text-sm font-bold text-primary"
            >
              <PhoneIcon className="h-4 w-4" /> Call {formatPhone()}
            </a>
          )}
          {customer ? (
            <button
              onClick={handleLogout}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 ring-1 ring-red-100"
            >
              <LogoutIcon className="h-4 w-4" /> Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={close}
              className="flex items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-primary shadow-md shadow-accent/25"
            >
              Login / Signup
            </Link>
          )}
        </div>
      </aside>
    </div>,
    document.body
  );

  return (
    <header
      className={`${overlay ? 'absolute inset-x-0 top-0 z-30' : 'sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur'}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:h-20 sm:gap-4 sm:px-6 lg:px-8">
        <Link to="/" className="mr-auto flex-shrink-0" onClick={close}>
          <img src={logo} alt="Roam Wheels" className="h-11 w-auto sm:h-16" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) =>
            l.hash ? (
              <a key={l.to} href={l.to} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-accent-600">
                {l.label}
              </a>
            ) : (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            )
          )}
        </nav>

        {SUPPORT_PHONE && (
          <a
            href={phoneLink()}
            aria-label={`Call us on ${formatPhone()}`}
            className="flex flex-shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-white/80 p-2 text-sm font-bold text-primary backdrop-blur transition-colors hover:border-accent-300 hover:text-accent-700 sm:px-3.5 sm:py-2"
          >
            <PhoneIcon className="h-4.5 w-4.5" />
            <span className="hidden whitespace-nowrap sm:inline">{formatPhone()}</span>
          </a>
        )}

        {customer && (
          <Link to="/profile" aria-label="My profile" title={customer.name} className="flex-shrink-0">
            <Avatar customer={customer} className="h-9 w-9 text-sm shadow-md ring-2 ring-white sm:h-10 sm:w-10" />
          </Link>
        )}

        {customer ? (
          <button
            onClick={handleLogout}
            className="hidden flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-red-200 hover:text-red-600 lg:flex"
          >
            <LogoutIcon className="h-4 w-4" /> Logout
          </button>
        ) : (
          <Link
            to="/login"
            onClick={close}
            className="flex-shrink-0 whitespace-nowrap rounded-full bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-dark sm:px-6 sm:py-2.5 sm:text-sm"
          >
            Login / Signup
          </Link>
        )}

        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="flex-shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-800 lg:hidden"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      {drawer}
    </header>
  );
}
