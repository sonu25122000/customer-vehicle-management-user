import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProfile } from '../api/portal';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import DocumentUploadModal from '../components/DocumentUploadModal';
import StatusChip from '../components/StatusChip';
import { DOCUMENTS, documentStatus, verificationMessage, verificationSummary } from '../utils/documents';
import { formatDate } from '../utils/format';
import { IdCardIcon, LicenseIcon, CameraIcon, ShieldCheckIcon, AlertIcon, ClockIcon, UploadIcon, ArrowRightIcon } from '../components/icons';

const DOCUMENT_ICONS = { aadhaar: IdCardIcon, drivingLicence: LicenseIcon, selfie: CameraIcon };
// While something is waiting for review, quietly re-check so the page updates once it's approved.
const REFRESH_MS = 30000;

function Banner({ summary, tripId }) {
  const tone = summary.verified
    ? { box: 'bg-emerald-50 text-emerald-800 ring-emerald-200', Icon: ShieldCheckIcon }
    : summary.rejected.length
      ? { box: 'bg-red-50 text-red-800 ring-red-200', Icon: AlertIcon }
      : summary.missing.length
        ? { box: 'bg-amber-50 text-amber-800 ring-amber-200', Icon: UploadIcon }
        : { box: 'bg-accent-50 text-accent-800 ring-accent-200', Icon: ClockIcon };
  const Icon = tone.Icon;

  return (
    <div className={`flex flex-col gap-3 rounded-2xl px-5 py-4 ring-1 sm:flex-row sm:items-center sm:justify-between ${tone.box}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold">
            {summary.verified
              ? 'Profile verified'
              : summary.rejected.length
                ? 'Action needed'
                : summary.missing.length
                  ? 'Verification required'
                  : 'Verification in progress'}
          </p>
          <p className="mt-0.5 text-sm">{verificationMessage(summary)}</p>
          {tripId && !summary.verified && (
            <p className="mt-1 text-xs opacity-80">You were trying to start a trip — you can do that as soon as your profile is verified.</p>
          )}
        </div>
      </div>
      {tripId && summary.verified && (
        <Link
          to={`/trips/${tripId}/start`}
          className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Start your trip <ArrowRightIcon className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  const { setCustomer } = useAuth();
  const [params] = useSearchParams();
  const tripId = params.get('trip');
  const [profile, setProfile] = useState(null);
  const [uploadTypes, setUploadTypes] = useState(null); // null = closed, otherwise the types to upload
  const wasVerified = useRef(null);

  const applyProfile = useCallback(
    (p) => {
      setProfile(p);
      setCustomer((c) => (c ? { ...c, profileVerified: p.profileVerified } : c));
      if (wasVerified.current === false && p.profileVerified === 'Accepted') toast.success('Your profile has been verified!');
      wasVerified.current = p.profileVerified === 'Accepted';
    },
    [setCustomer]
  );

  useEffect(() => {
    fetchProfile()
      .then(applyProfile)
      .catch((err) => toast.error(errorMessage(err, 'Could not load your documents')));
  }, [applyProfile]);

  const summary = profile ? verificationSummary(profile) : null;
  const waiting = summary && !summary.verified && summary.inReview.length > 0;
  useEffect(() => {
    if (!waiting) return undefined;
    const timer = setInterval(() => {
      fetchProfile()
        .then(applyProfile)
        .catch(() => {});
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [waiting, applyProfile]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="h-24 animate-pulse rounded-2xl bg-white" />
        <div className="mt-6 h-72 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  const onFile = profile.documents.map((d) => d.type);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
      <h1 className="text-xl font-extrabold text-primary sm:text-2xl">Verification Documents</h1>
      <p className="mt-1 text-sm text-slate-500">
        Your Aadhaar, driving license and a selfie are needed to start a trip. Each one is checked separately.
      </p>

      <div className="mt-5">
        <Banner summary={summary} tripId={tripId} />
      </div>

      <div className="mt-6 divide-y divide-dashed divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5 shadow-sm">
        {DOCUMENTS.map((d) => {
          const doc = summary.byType[d.type];
          const status = documentStatus(doc);
          const Icon = DOCUMENT_ICONS[d.type];
          const action = !doc ? 'Upload' : doc.status === 'Rejected' ? 'Upload again' : 'Replace';
          return (
            <div key={d.type} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 ring-1 ring-accent-100">
                  <Icon className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-bold text-slate-900">{d.label}</p>
                    <StatusChip status={status} />
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {doc
                      ? `Uploaded ${formatDate(doc.uploadedAt)}${doc.status === 'Approved' && doc.reviewedAt ? ` · verified ${formatDate(doc.reviewedAt)}` : ''}`
                      : d.hint || 'Not uploaded yet'}
                  </p>
                  {doc?.status === 'Rejected' && doc.rejectionReason && (
                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-100">
                      <span className="font-semibold">Why it wasn&apos;t accepted:</span> {doc.rejectionReason}
                    </p>
                  )}
                  {doc && doc.status !== 'Approved' && doc.status !== 'Rejected' && (
                    <p className="mt-1 text-xs text-accent-700">We&apos;re checking this one — no action needed.</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setUploadTypes([d.type])}
                className={`flex-shrink-0 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-bold transition-colors ${
                  !doc || doc.status === 'Rejected'
                    ? 'bg-accent text-primary shadow-md shadow-accent/20 hover:bg-accent-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {action}
              </button>
            </div>
          );
        })}
      </div>

      {summary.missing.length > 1 && (
        <button
          onClick={() => setUploadTypes(summary.missing.map((d) => d.type))}
          className="mt-4 w-full cursor-pointer rounded-xl bg-accent px-4 py-3 text-sm font-bold text-primary shadow-md shadow-accent/20 hover:bg-accent-600"
        >
          Upload all missing documents ({summary.missing.length})
        </button>
      )}

      <p className="mt-4 text-center text-xs text-slate-400">
        Replacing a verified document sends just that one for review again.
      </p>

      {uploadTypes && (
        <DocumentUploadModal
          only={uploadTypes}
          onFile={onFile}
          onClose={() => setUploadTypes(null)}
          onUploaded={(result) => {
            setProfile((p) => ({ ...p, ...result }));
            setCustomer((c) => (c ? { ...c, profileVerified: result.profileVerified } : c));
            wasVerified.current = result.profileVerified === 'Accepted';
            setUploadTypes(null);
          }}
        />
      )}
    </div>
  );
}
