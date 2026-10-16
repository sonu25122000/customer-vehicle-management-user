import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateProfile } from '../api/portal';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LockIcon } from './icons';

export const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent-100';
export const labelClass = 'text-xs font-semibold text-slate-600';

// Name / email editor for the profile page. The mobile number is shown but can't be edited — it's the
// customer's login. Saving goes through PATCH /portal/profile, which keeps every change in the
// customer's edit history.
export default function ProfileForm({ initial, onSaved, onCancel, submitLabel = 'Save Changes', showEmail = true }) {
  const { setCustomer } = useAuth();
  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
  });
  const [saving, setSaving] = useState(false);

  const unchanged = form.name.trim() === (initial?.name || '') && form.email.trim() === (initial?.email || '');

  async function handleSubmit(e) {
    e.preventDefault();
    if (unchanged) {
      onSaved?.(initial, false);
      return;
    }
    setSaving(true);
    try {
      const saved = await updateProfile({ name: form.name.trim(), email: form.email.trim() });
      setCustomer((c) => ({ ...c, ...saved }));
      toast.success('Profile updated');
      onSaved?.(saved, true);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update your profile'));
    } finally {
      setSaving(false);
    }
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
          <span className={labelClass}>Email (optional)</span>
          <input
            className={inputClass}
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            autoComplete="email"
          />
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
