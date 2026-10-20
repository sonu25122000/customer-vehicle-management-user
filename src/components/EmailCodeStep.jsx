import { useEffect, useState } from 'react';
import OtpInput from './OtpInput';
import { MailIcon } from './icons';

const CODE_LENGTH = 6;

// "m:ss" until `until`, or '' once it's passed.
function countdown(until, now) {
  const ms = new Date(until).getTime() - now;
  if (!(ms > 0)) return '';
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Entering the 6-digit code emailed to verify an address (signup, or changing the profile email).
// `sent` is { expiresAt, resendAt } from the server. onSubmit(code) / onResend() are async; onBack goes
// back to change the email. A spam-folder reminder is always shown — codes sometimes land there.
export default function EmailCodeStep({ email, sent, onSubmit, onResend, onBack, submitLabel = 'Verify', busy = false, code, onCodeChange }) {
  const [now, setNow] = useState(() => Date.now());
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const validFor = countdown(sent.expiresAt, now);
  const resendIn = countdown(sent.resendAt, now);

  async function resend() {
    setResending(true);
    try {
      await onResend();
    } finally {
      setResending(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.length === CODE_LENGTH && validFor) onSubmit(code);
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-50 text-accent-600 ring-8 ring-accent-50/60">
          <MailIcon className="h-6 w-6" />
        </span>
        <p className="text-sm text-gray-600">
          We&apos;ve sent a {CODE_LENGTH}-digit code to
          <span className="block break-all font-semibold text-gray-900">{email}</span>
        </p>
      </div>

      <OtpInput value={code} onChange={onCodeChange} disabled={busy} autoFocus length={CODE_LENGTH} />

      <p className={`text-center text-xs font-semibold ${validFor ? 'text-gray-500' : 'text-red-600'}`}>
        {validFor ? `Code valid for ${validFor}` : 'This code has expired — send a new one.'}
      </p>

      <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-800 ring-1 ring-amber-100">
        Didn&apos;t get the email? Please check your <span className="font-semibold">spam / junk</span> folder — it sometimes lands there.
      </p>

      <button
        type="submit"
        disabled={busy || code.length !== CODE_LENGTH || !validFor}
        className="w-full cursor-pointer rounded-lg bg-accent px-4 py-3 text-sm font-bold text-primary shadow-md shadow-accent/20 transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Checking...' : submitLabel}
      </button>

      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} disabled={busy} className="cursor-pointer font-semibold text-gray-500 hover:text-gray-800 hover:underline">
          Change email
        </button>
        <button
          type="button"
          onClick={resend}
          disabled={busy || resending || Boolean(resendIn)}
          className="cursor-pointer font-semibold text-accent-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
        >
          {resending ? 'Sending...' : resendIn ? `Resend code in ${resendIn}` : 'Resend code'}
        </button>
      </div>
    </form>
  );
}
