import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { subscribe } from '../api/portal';
import { errorMessage } from '../api/client';
import { CheckIcon, MailIcon } from './icons';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Open envelope with a "%" offer card — decorative.
function EnvelopeArt({ className }) {
  return (
    <svg viewBox="0 0 240 200" className={className} aria-hidden="true">
      <path
        d="M60 22c38-20 98-14 132 18s40 88 14 122-86 40-128 26S8 140 10 98 22 42 60 22Z"
        className="fill-accent-100"
      />
      <g stroke="#f5b82e" strokeWidth="7" strokeLinecap="round">
        <path d="M170 28l-6 24" />
        <path d="M202 52l-20 12" />
        <path d="M206 88l-20-3" />
        <path d="M34 92l18 10" />
        <path d="M30 128l18-8" />
      </g>
      <rect x="54" y="92" width="136" height="88" rx="10" fill="#f2a93b" />
      <g transform="rotate(-8 122 92)">
        <rect x="76" y="44" width="92" height="96" rx="10" fill="#fff" />
        <text x="122" y="112" textAnchor="middle" fontSize="56" fontWeight="800" fill="#ef4444" fontFamily="system-ui, sans-serif">
          %
        </text>
      </g>
      <path d="M54 112l68 40 68-40v58a10 10 0 0 1-10 10H64a10 10 0 0 1-10-10Z" fill="#fbc65a" />
      <path d="M58 176l52-34M186 176l-52-34" stroke="#e39a2b" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// "Let us know your email" — collects emails for offers (stored by POST /api/portal/subscribe, which
// also sends a welcome email). Shown to everyone, always starting empty — even for a logged-in guest.
export default function NewsletterSection() {
  const { checking } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (checking) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError('Enter a valid email address');
      return;
    }
    setSubmitting(true);
    try {
      const res = await subscribe(value);
      setDone(true);
      toast.success(res.message || 'Thanks for subscribing!');
    } catch (err) {
      setError(errorMessage(err, 'Could not subscribe. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="newsletter-heading" className="bg-white px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 rounded-3xl bg-gradient-to-br from-accent-50 via-white to-accent-50 p-6 shadow-sm ring-1 ring-accent-100 sm:p-10 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-10 lg:grid-cols-[minmax(0,19rem)_1fr] lg:p-12">
        <EnvelopeArt className="mx-auto w-40 sm:w-52 md:w-full" />

        <div className="text-center md:text-left">
          <h2 id="newsletter-heading" className="text-2xl font-extrabold text-primary sm:text-4xl">
            Let us know your email
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-lg">
            We&apos;ll send you amazing offers, exclusive deals and updates from RoamWheels.
          </p>

          {done ? (
            <p className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
              <CheckIcon className="h-5 w-5" /> You&apos;re subscribed! Watch your inbox for offers.
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <span className="sr-only">Email address</span>
                  <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    inputMode="email"
                    // No browser autofill: the box should start empty, not with a saved address.
                    name="newsletter-email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your email address"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'newsletter-error' : undefined}
                    className={`w-full rounded-xl border bg-white py-3.5 pl-12 pr-4 text-sm outline-none transition-colors focus:ring-2 sm:text-base ${
                      error ? 'border-red-400 focus:ring-red-100' : 'border-slate-300 focus:border-accent focus:ring-accent-100'
                    }`}
                  />
                </label>
                <button
                  type="submit"
                  disabled={submitting}
                  className="cursor-pointer rounded-xl bg-accent px-8 py-3.5 text-sm font-bold text-primary shadow-lg shadow-accent/25 transition-colors hover:bg-accent-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
                >
                  {submitting ? 'Subscribing…' : 'Subscribe'}
                </button>
              </div>
              {error && (
                <p id="newsletter-error" className="mt-2 text-left text-xs font-medium text-red-600">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
