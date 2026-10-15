import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { LogoutIcon, MenuIcon, XIcon, PhoneIcon } from './icons';
import logo from '../assets/logo.png';
import { BOOKING_ENABLED } from '../utils/features';
import { SUPPORT_PHONE, phoneLink, formatPhone } from '../utils/contact';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}`;

// `overlay` = sits on top of the home page hero (no background of its own).
// On phones the call button and "Login / Signup" stay in the bar itself — only the page links go in
// the menu.
export default function Navbar({ overlay = false }) {
  const { customer, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    setOpen(false);
    await logout();
    toast.success('Logged out');
    navigate('/', { replace: true });
  }

  const carsLink = BOOKING_ENABLED ? { to: '/book', label: 'Book a Car' } : { to: '/cars', label: 'Our Cars' };
  const links = customer
    ? [carsLink, { to: '/trips', label: 'My Trips' }, { to: '/documents', label: 'Documents' }, { to: '/profile', label: 'Profile' }]
    : [
        carsLink,
        { to: '/#reviews', label: 'Reviews', hash: true },
        { to: '/#faq', label: "FAQ's", hash: true },
        { to: '/#contact', label: 'Contact Us', hash: true },
      ];

  return (
    <header
      className={`${overlay ? 'absolute inset-x-0 top-0 z-30' : 'sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur'}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:h-20 sm:gap-4 sm:px-6 lg:px-8">
        <Link to="/" className="mr-auto flex-shrink-0" onClick={() => setOpen(false)}>
          <img src={logo} alt="Roam Wheels" className="h-11 w-auto sm:h-16" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) =>
            l.hash ? (
              <a key={l.to} href={l.to} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600">
                {l.label}
              </a>
            ) : (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            )
          )}
        </nav>

        {SUPPORT_PHONE && (
          <a
            href={phoneLink()}
            aria-label={`Call us on ${formatPhone()}`}
            className="flex flex-shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-white/80 p-2 text-sm font-bold text-navy backdrop-blur transition-colors hover:border-blue-400 hover:text-blue-700 sm:px-3.5 sm:py-2"
          >
            <PhoneIcon className="h-4.5 w-4.5" />
            <span className="hidden whitespace-nowrap sm:inline">{formatPhone()}</span>
          </a>
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
            onClick={() => setOpen(false)}
            className="flex-shrink-0 whitespace-nowrap rounded-full bg-navy px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-navy/25 transition-colors hover:bg-ink sm:px-6 sm:py-2.5 sm:text-sm"
          >
            Login / Signup
          </Link>
        )}

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="flex-shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-800 lg:hidden"
        >
          {open ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 shadow-lg lg:hidden">
          <nav className="flex flex-col">
            {links.map((l) =>
              l.hash ? (
                <a key={l.to} href={l.to} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700" onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ) : (
                <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                  {l.label}
                </NavLink>
              )
            )}
            {customer && (
              <button
                onClick={handleLogout}
                className="mt-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-red-600"
              >
                <LogoutIcon className="h-4 w-4" /> Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
