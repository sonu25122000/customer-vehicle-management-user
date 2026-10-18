import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProfile, profilePhotoUrl, removeProfilePhoto, uploadProfilePhoto } from '../api/portal';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ProfileForm from '../components/ProfileForm';
import StatusChip from '../components/StatusChip';
import { DOCUMENTS, documentStatus, verificationMessage, verificationSummary } from '../utils/documents';
import { compressImage } from '../utils/compressImage';
import {
  IdCardIcon,
  LicenseIcon,
  CameraIcon,
  PencilIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  StarIcon,
  LogoutIcon,
  LockIcon,
  EyeIcon,
  KeyIcon,
} from '../components/icons';

const DOCUMENT_ICONS = { aadhaar: IdCardIcon, drivingLicence: LicenseIcon, selfie: CameraIcon };

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

// Logout is a text link, not a button — clearly readable, but not prominent.
const LOGOUT_LINK_CLASS =
  'cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold text-slate-600 underline-offset-4 transition-colors hover:text-red-600 hover:underline';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Avatar with a progress ring showing how many of the 3 verification documents are verified. Shows the
// customer's profile picture when they've uploaded one; the camera button picks a new one.
function Avatar({ name, progress, photoVersion, uploading, onPick }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  // The version whose image failed to load (e.g. storage unavailable) — falls back to the initials.
  const [brokenVersion, setBrokenVersion] = useState(null);
  const showPhoto = photoVersion && brokenVersion !== photoVersion;
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-2.5 flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-light to-primary-dark text-3xl font-extrabold text-white">
        {showPhoto ? (
          <img src={profilePhotoUrl(photoVersion)} alt={name} className="h-full w-full object-cover" onError={() => setBrokenVersion(photoVersion)} />
        ) : (
          initials(name) || <UserIcon className="h-10 w-10" />
        )}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-primary/60">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          </span>
        )}
      </div>
      <label
        className={`absolute bottom-0.5 right-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-accent-600 shadow-md ring-1 ring-slate-200 transition-colors hover:bg-accent-50 ${
          uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'
        }`}
        title={photoVersion ? 'Change photo' : 'Add a profile photo'}
      >
        <CameraIcon className="h-4.5 w-4.5" />
        <span className="sr-only">{photoVersion ? 'Change profile photo' : 'Add a profile photo'}</span>
        <input
          type="file"
          accept={PHOTO_TYPES.join(',')}
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) onPick(file);
          }}
        />
      </label>
    </div>
  );
}

function PasswordField({ label, value, onChange, autoComplete, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="relative">
        <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={6}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition-colors focus:border-accent-300 focus:bg-white focus:ring-2 focus:ring-accent-100"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
        >
          <EyeIcon off={show} className="h-4.5 w-4.5" />
        </button>
      </span>
    </label>
  );
}

// Change password: current one, then the new one twice.
function ChangePasswordForm({ onDone, onCancel }) {
  const { changePassword } = useAuth();
  const [form, setForm] = useState({ current: '', password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('New password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('New passwords do not match');
    if (form.password === form.current) return toast.error('Choose a new password that is different from the current one');
    setSaving(true);
    try {
      await changePassword(form.current, form.password);
      toast.success('Password updated');
      onDone();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update your password'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PasswordField label="Current password" value={form.current} onChange={set('current')} autoComplete="current-password" placeholder="Your current password" />
      <PasswordField label="New password" value={form.password} onChange={set('password')} autoComplete="new-password" placeholder="At least 6 characters" />
      <PasswordField label="Confirm new password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" placeholder="Re-enter the new password" />
      <div className="mt-1 flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={saving} className="cursor-pointer rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-primary shadow-md shadow-accent/20 hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Update password'}
        </button>
      </div>
    </form>
  );
}

function Row({ icon: Icon, title, children, right }) {
  return (
    <div className="flex items-start gap-4 py-4">
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 ring-1 ring-accent-100">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold text-slate-900">{title}</p>
        <div className="mt-0.5 break-words text-sm text-slate-500">{children}</div>
      </div>
      {right && <div className="flex-shrink-0 pt-0.5">{right}</div>}
    </div>
  );
}

function Section({ title, subtitle, action, children }) {
  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary">{title}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-5 shadow-sm">{children}</div>
    </section>
  );
}

export default function ProfilePage() {
  const { logout, setCustomer } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  // The picture is shrunk in the browser first, then has to be an image under 2 MB.
  async function handlePhoto(file) {
    if (!PHOTO_TYPES.includes(file.type)) {
      toast.error('Choose a JPEG, PNG or WebP image');
      return;
    }
    setPhotoBusy(true);
    try {
      const small = await compressImage(file, { maxDimension: 800, targetBytes: 500 * 1024 });
      if (small.size > MAX_PHOTO_BYTES) {
        toast.error('This photo is too large — the maximum is 2 MB');
        return;
      }
      const saved = await uploadProfilePhoto(small);
      setProfile((p) => ({ ...p, ...saved }));
      setCustomer((c) => (c ? { ...c, ...saved } : c));
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not upload your photo'));
    } finally {
      setPhotoBusy(false);
    }
  }

  async function handleRemovePhoto() {
    setPhotoBusy(true);
    try {
      const saved = await removeProfilePhoto();
      setProfile((p) => ({ ...p, ...saved }));
      setCustomer((c) => (c ? { ...c, ...saved } : c));
      toast.success('Profile photo removed');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not remove your photo'));
    } finally {
      setPhotoBusy(false);
    }
  }

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch((err) => toast.error(errorMessage(err, 'Could not load your profile')));
  }, []);

  if (!profile) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-40 animate-pulse rounded-2xl bg-white" />
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  const summary = verificationSummary(profile);
  const approvedCount = summary.approved.length;
  const years = Math.floor((Date.now() - new Date(profile.createdAt)) / (365.25 * 24 * 60 * 60 * 1000));

  async function handleLogout() {
    // Go home first: this page is members-only, so logging out here would bounce to the login page.
    navigate('/', { replace: true });
    await logout();
    toast.success('Logged out');
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-extrabold text-primary sm:text-2xl">My Profile</h1>
        {/* Desktop only — on phones/tablets Logout lives in the hamburger menu (Navbar). */}
        <button type="button" onClick={handleLogout} className={`${LOGOUT_LINK_CLASS} hidden lg:inline-flex`}>
          <LogoutIcon className="h-4 w-4" /> Logout
        </button>
      </div>

      {/* Phone/tablet: one column. Desktop: summary card (sticky) on the left, the two sections on the right. */}
      <div className="mt-4 grid grid-cols-1 gap-8 lg:mt-6 lg:grid-cols-[320px_1fr] lg:items-start xl:grid-cols-[360px_1fr]">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-28">
          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-[1.3fr_1fr] lg:grid-cols-1">
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-6">
              <Avatar
                name={profile.name}
                progress={approvedCount / DOCUMENTS.length}
                photoVersion={profile.photoVersion}
                uploading={photoBusy}
                onPick={handlePhoto}
              />
              {profile.photoVersion && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={photoBusy}
                  className="-mt-1 cursor-pointer text-xs font-semibold text-slate-500 hover:text-red-600 disabled:cursor-not-allowed"
                >
                  Remove photo
                </button>
              )}
              <button
                onClick={() => setEditing(true)}
                className="flex cursor-pointer items-center gap-2 text-lg font-bold text-slate-900 hover:text-accent-600"
              >
                {profile.name} <PencilIcon className="h-4 w-4 text-slate-500" />
              </button>
              <StatusChip
                status={profile.profileVerified === 'Accepted' ? 'Verified' : profile.profileVerified === 'Rejected' ? 'Rejected' : 'Pending'}
                label={
                  profile.profileVerified === 'Accepted'
                    ? 'Profile verified'
                    : profile.profileVerified === 'Rejected'
                      ? 'Action needed on documents'
                      : `${approvedCount}/${DOCUMENTS.length} documents verified`
                }
              />
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 sm:grid-cols-1 sm:divide-x-0 sm:divide-y sm:border-l sm:border-t-0 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:border-l-0 lg:border-t">
              <div className="px-3 py-4 text-center sm:px-5 sm:text-left lg:px-3 lg:text-center">
                <p className="text-2xl font-extrabold text-slate-900">{profile.stats.totalTrips}</p>
                <p className="text-xs text-slate-500">Trips</p>
              </div>
              <div className="px-3 py-4 text-center sm:px-5 sm:text-left lg:px-3 lg:text-center">
                <p className="text-2xl font-extrabold text-slate-900">{years < 1 ? 'New' : years}</p>
                <p className="text-xs text-slate-500">{years < 1 ? 'Member' : `Year${years === 1 ? '' : 's'} with us`}</p>
              </div>
              <div className="px-3 py-4 text-center sm:px-5 sm:text-left lg:px-3 lg:text-center">
                <p className="flex items-center justify-center gap-1 text-2xl font-extrabold text-slate-900 sm:justify-start lg:justify-center">
                  {profile.rating || 'NA'} <StarIcon className="h-5 w-5 text-accent" />
                </p>
                <p className="text-xs text-slate-500">Rating</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex flex-col gap-8">
          <Section title="Verification details" subtitle="Verification details are mandatory to start your trip.">
            <p
              className={`mt-4 rounded-xl px-4 py-2.5 text-sm ring-1 ${
                summary.verified
                  ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                  : summary.rejected.length
                    ? 'bg-red-50 text-red-800 ring-red-200'
                    : 'bg-accent-50 text-accent-800 ring-accent-200'
              }`}
            >
              {verificationMessage(summary)}
            </p>
            <div className="divide-y divide-dashed divide-slate-200">
              {DOCUMENTS.map((d) => {
                const doc = summary.byType[d.type];
                return (
                  <Row key={d.type} icon={DOCUMENT_ICONS[d.type]} title={d.label} right={<StatusChip status={documentStatus(doc)} />}>
                    {doc?.status === 'Rejected' && doc.rejectionReason ? (
                      <span className="text-red-600">Not accepted: {doc.rejectionReason}</span>
                    ) : (
                      d.hint
                    )}
                  </Row>
                );
              })}
            </div>
            <div className="pb-5 pt-1">
              <Link
                to="/documents"
                className="block w-full rounded-xl bg-accent px-4 py-3 text-center text-sm font-bold text-primary shadow-md shadow-accent/20 transition-colors hover:bg-accent-600"
              >
                {summary.verified ? 'View documents' : summary.missing.length || summary.rejected.length ? 'Upload documents' : 'View documents'}
              </Link>
            </div>
          </Section>

          <Section
            title="Personal details"
            subtitle="Sharing your personal details helps hosts know you better and builds trust."
            action={
              <button
                onClick={() => setEditing(true)}
                aria-label="Edit personal details"
                className="cursor-pointer rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-accent-600"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            }
          >
            <div className="divide-y divide-dashed divide-slate-200">
              <Row icon={UserIcon} title="Name">
                {profile.name}
              </Row>
              <Row icon={PhoneIcon} title="Mobile Number" right={<LockIcon className="h-4 w-4 text-slate-400" aria-label="Can't be changed" />}>
                +91 {profile.mobile1}
                <span className="block text-xs text-slate-400">Your login — can&apos;t be changed</span>
              </Row>
              <Row icon={MailIcon} title="Email id">
                {profile.email || <span className="text-slate-400">Not added</span>}
              </Row>
            </div>
          </Section>

          <Section title="Login & security" subtitle="Keep your account safe — use a password you don't use anywhere else.">
            <div className="divide-y divide-dashed divide-slate-200">
              <Row
                icon={KeyIcon}
                title="Password"
                right={
                  <button
                    type="button"
                    onClick={() => setChangingPassword(true)}
                    className="cursor-pointer rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-bold text-accent-600 transition-colors hover:border-accent-200 hover:bg-accent-50"
                  >
                    Change
                  </button>
                }
              >
                <span className="tracking-[0.3em]">••••••••</span>
                <span className="block text-xs text-slate-400">You log in with +91 {profile.mobile1} and this password</span>
              </Row>
            </div>
          </Section>
        </div>
      </div>

      {editing && (
        <Modal title="Edit personal details" onClose={() => setEditing(false)}>
          <ProfileForm
            initial={profile}
            onCancel={() => setEditing(false)}
            onSaved={(saved) => {
              setProfile((p) => ({ ...p, ...saved }));
              setEditing(false);
            }}
          />
        </Modal>
      )}

      {changingPassword && (
        <Modal title="Change password" onClose={() => setChangingPassword(false)}>
          <ChangePasswordForm onDone={() => setChangingPassword(false)} onCancel={() => setChangingPassword(false)} />
        </Modal>
      )}
    </div>
  );
}
