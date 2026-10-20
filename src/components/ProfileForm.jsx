import { useState } from 'react';
import toast from 'react-hot-toast';
import { sendProfileEmailCode, updateProfile } from '../api/portal';
import EmailCodeStep from './EmailCodeStep';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LockIcon } from './icons';

export const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent-100';
export const labelClass = 'text-xs font-semibold text-slate-600';

// Name / email editor for the profile page. The mobile number is shown but can't be edited — it's the
// customer's login. Saving goes through PATCH /portal/profile, which keeps every change in the
// customer's edit history. A new email is only saved after the code emailed to it is entered.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfileForm({ initial, onSaved, onCancel, submitLabel = 'Save Changes', showEmail = true }) {
  const { setCustomer } = useAuth();
  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
  });
  const [saving, setSaving] = useState(false);
  // Verifying a new email: { expiresAt, resendAt } once the code is sent.
  const [sent, setSent] = useState(null);
  const [code, setCode] = useState('');

  const emailChanged = showEmail && form.email.trim().toLowerCase() !== (initial?.email || '').toLowerCase();
  const unchanged = form.name.trim() === (initial?.name || '') && !emailChanged;

  async function save(extra = {}) {
    setSaving(true);
    try {
      const saved = await updateProfile({ name: form.name.trim(), email: form.email.trim(), ...extra });
      setCustomer((c) => ({ ...c, ...saved }));
      toast.success(extra.emailCode ? 'Email verified and profile updated' : 'Profile updated');
      onSaved?.(saved, true);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update your profile'));
      const errCode = err?.response?.data?.code;
      if (errCode === 'EMAIL_OTP_INVALID' || errCode === 'EMAIL_OTP_LOCKED' || errCode === 'EMAIL_OTP_EXPIRED') setCode('');
      if (errCode === 'EMAIL_IN_USE') setSent(null);
    } finally {
      setSaving(false);
    }
  }

  async function sendCode() {
    const result = await sendProfileEmailCode(form.email.trim());
    setSent(result);
    setCode('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (showEmail && !EMAIL_RE.test(form.email.trim())) {
      toast.error(form.email.trim() ? 'Enter a valid email address' : 'Email is required');
      return;
    }
    if (unchanged) {
      onSaved?.(initial, false);
      return;
    }
    if (!emailChanged) {
      await save();
      return;
    }
    // A new email: send a code to it first; the change is saved once the code is entered.
    setSaving(true);
    try {
      await sendCode();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not send the code'));
    } finally {
      setSaving(false);
    }
  }

  if (sent) {
    return (
      <EmailCodeStep
        email={form.email.trim()}
        sent={sent}
        code={code}
        onCodeChange={setCode}
        busy={saving}
        submitLabel="Verify & Save"
        onSubmit={(emailCode) => save({ emailCode })}
        onResend={() =>
          sendCode()
            .then(() => toast.success('A new code is on its way'))
            .catch((err) => toast.error(errorMessage(err, 'Could not send the code')))
        }
        onBack={() => setSent(null)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Full Name</span>
        <input
          className={inputClass}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          maxLength={50}
          autoComplete="name"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Mobile Number</span>
        <div className="relative">
          <input
            className={`${inputClass} cursor-not-allowed bg-slate-100 pr-10 text-slate-500`}
            type="tel"
            value={initial?.mobile1 || ''}
            disabled
            readOnly
          />
          <LockIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        <span className="text-xs text-slate-400">This is your login and can&apos;t be changed. Contact us if it needs updating.</span>
      </label>
      {showEmail && (
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Email</span>
          <input
            className={inputClass}
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            maxLength={254}
            autoComplete="email"
            placeholder="you@example.com"
          />
          {emailChanged && <span className="text-xs text-slate-500">We&apos;ll email a code to the new address to verify it.</span>}
        </label>
      )}
      <div className="flex justify-end gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-accent-600 disabled:cursor-wait disabled:opacity-60"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
