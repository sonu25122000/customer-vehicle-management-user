import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { LogoutIcon, MenuIcon, XIcon } from './icons';
import logo from '../assets/logo.png';
import { BOOKING_ENABLED } from '../utils/features';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
  }`;

// `overlay` = sits on top of the home page hero (no background of its own).
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
    ? [
        carsLink,
        { to: '/trips', label: 'My Trips' },
        { to: '/documents', label: 'Documents' },
        { to: '/profile', label: 'Profile' },
      ]
    : [carsLink];

  return (
    <header
      className={`${overlay ? 'absolute inset-x-0 top-0 z-30' : 'sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur'}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link to="/" className="flex-shrink-0" onClick={() => setOpen(false)}>
          <img src={logo} alt="Roam Wheels" className="h-13 w-auto sm:h-16" />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          {customer ? (
            <button
              onClick={handleLogout}
              className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-red-200 hover:text-red-600"
            >
              <LogoutIcon className="h-4 w-4" /> Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <Link
                to="/signup"
                className="ml-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-colors hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="ml-auto cursor-pointer rounded-lg p-2 text-slate-800 md:hidden"
        >
          {open ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 shadow-lg md:hidden">
          <nav className="flex flex-col">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            {customer ? (
              <button
                onClick={handleLogout}
                className="mt-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-red-600"
              >
                <LogoutIcon className="h-4 w-4" /> Logout
              </button>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-blue-600 py-2.5 text-center text-sm font-bold text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
