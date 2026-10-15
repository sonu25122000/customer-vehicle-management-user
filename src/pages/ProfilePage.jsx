import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProfile } from '../api/portal';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ProfileForm from '../components/ProfileForm';
import StatusChip from '../components/StatusChip';
import { DOCUMENTS, documentStatus, verificationMessage, verificationSummary } from '../utils/documents';
import { IdCardIcon, LicenseIcon, CameraIcon, PencilIcon, UserIcon, PhoneIcon, MailIcon, StarIcon, LogoutIcon, LockIcon } from '../components/icons';

const DOCUMENT_ICONS = { aadhaar: IdCardIcon, drivingLicence: LicenseIcon, selfie: CameraIcon };

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

// Avatar with a progress ring showing how many of the 3 verification documents are verified.
function Avatar({ name, progress }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#2563eb"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-2.5 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-navy text-3xl font-extrabold text-white">
        {initials(name) || <UserIcon className="h-10 w-10" />}
      </div>
    </div>
  );
}

function Row({ icon: Icon, title, children, right }) {
  return (
    <div className="flex items-start gap-4 py-4">
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
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
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-5 shadow-sm">{children}</div>
    </section>
  );
}

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);

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
    await logout();
    toast.success('Logged out');
    navigate('/', { replace: true });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">My Profile</h1>

      {/* Phone/tablet: one column. Desktop: summary card (sticky) on the left, the two sections on the right. */}
      <div className="mt-4 grid grid-cols-1 gap-8 lg:mt-6 lg:grid-cols-[320px_1fr] lg:items-start xl:grid-cols-[360px_1fr]">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-28">
          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-[1.3fr_1fr] lg:grid-cols-1">
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-6">
              <Avatar name={profile.name} progress={approvedCount / DOCUMENTS.length} />
              <button
                onClick={() => setEditing(true)}
                className="flex cursor-pointer items-center gap-2 text-lg font-bold text-slate-900 hover:text-blue-600"
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
                  {profile.rating || 'NA'} <StarIcon className="h-5 w-5 text-amber-400" />
                </p>
                <p className="text-xs text-slate-500">Rating</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="hidden lg:flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-red-600 shadow-sm transition-colors hover:bg-red-50"
          >
            <LogoutIcon className="h-4.5 w-4.5" /> Logout
          </button>
        </aside>

        <div className="flex flex-col gap-8">
          <Section title="Verification details" subtitle="Verification details are mandatory to start your trip.">
            <p
              className={`mt-4 rounded-xl px-4 py-2.5 text-sm ring-1 ${
                summary.verified
                  ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                  : summary.rejected.length
                    ? 'bg-red-50 text-red-800 ring-red-200'
                    : 'bg-blue-50 text-blue-800 ring-blue-200'
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
                className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-colors hover:bg-blue-700"
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
                className="cursor-pointer rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-600"
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

        </div>
      </div>

      <button
        onClick={handleLogout}
        className="mt-8 flex lg:hidden w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-red-600 shadow-sm transition-colors hover:bg-red-50"
      >
        <LogoutIcon className="h-4.5 w-4.5" /> Logout
      </button>

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

    </div>
  );
}
