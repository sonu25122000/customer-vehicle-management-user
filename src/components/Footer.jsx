import { Link } from 'react-router-dom';
import logo from '../assets/logo2.png';
import { INSTAGRAM_URL, INSTAGRAM_HANDLE, SUPPORT_PHONE, SUPPORT_EMAIL, phoneLink, formatPhone, whatsappLink } from '../utils/contact';
import { InstagramIcon, PhoneIcon, MailIcon, WhatsAppIcon } from './icons';

// logo2.png is drawn on a near-black box; mix-blend-lighten lets the footer colour show through it instead.
export default function Footer() {
  return (
    <footer className="bg-primary text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <img src={logo} alt="Roam Wheels" className="h-10 w-auto mix-blend-lighten" />
          <p className="mt-3 max-w-xs text-sm text-slate-400">Self-drive car rentals in Whitefield, Bengaluru — reliable cars, flexible plans and a hassle-free experience. We operate only in Bengaluru.</p>
          <p className="mt-3 text-sm font-medium text-slate-300">
            Drive More <span className="mx-2 text-slate-600">|</span> Worry Less
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Explore</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li>
              <Link to="/cars" className="hover:text-white">
                Our Cars
              </Link>
            </li>
            <li>
              <a href="/#reviews" className="hover:text-white">
                Reviews
              </a>
            </li>
            <li>
              <a href="/#faq" className="hover:text-white">
                FAQs
              </a>
            </li>
            <li>
              <Link to="/login" className="hover:text-white">
                Login / Signup
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Get in touch</p>
          <ul className="mt-3 flex flex-col gap-2.5 text-sm">
            {SUPPORT_PHONE && (
              <li>
                <a href={phoneLink()} className="flex items-center gap-2 hover:text-white">
                  <PhoneIcon className="h-4 w-4" /> {formatPhone()}
                </a>
              </li>
            )}
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp Us
              </a>
            </li>
            {SUPPORT_EMAIL && (
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2 hover:text-white">
                  <MailIcon className="h-4 w-4" /> {SUPPORT_EMAIL}
                </a>
              </li>
            )}
            <li>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
                <InstagramIcon className="h-4 w-4" /> {INSTAGRAM_HANDLE}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-4 pb-24 text-center text-xs text-slate-500 sm:px-6 sm:pb-4 lg:px-8">
          © {new Date().getFullYear()} Roam Wheels · Car rental in Whitefield, Bengaluru. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
