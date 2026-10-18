import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import StatusChip from './StatusChip';
import { uploadDocuments } from '../api/portal';
import { errorMessage } from '../api/client';
import { compressImage } from '../utils/compressImage';
import { DOCUMENTS, documentFileUrl, documentStatus, isPdf } from '../utils/documents';
import { formatDate } from '../utils/format';
import { IdCardIcon, LicenseIcon, CameraIcon, EyeIcon, UploadIcon } from './icons';

const DOCUMENT_ICONS = { aadhaar: IdCardIcon, aadhaarBack: IdCardIcon, drivingLicence: LicenseIcon, selfie: CameraIcon };
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// The uploaded file, full size — an image inline, a PDF in a new tab.
function DocumentViewer({ label, doc, onClose }) {
  const url = documentFileUrl(doc);
  return (
    <Modal title={label} onClose={onClose} wide>
      {isPdf(doc) ? (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-600">This document is a PDF.</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-primary hover:bg-accent-600"
          >
            Open PDF
          </a>
        </div>
      ) : (
        <img src={url} alt={label} className="mx-auto max-h-[70dvh] w-auto rounded-lg bg-slate-50 object-contain" />
      )}
      <p className="mt-3 text-center text-xs text-slate-400">Uploaded {formatDate(doc.uploadedAt)}</p>
    </Modal>
  );
}

// Every verification document with its status, and the actions right on the row: picking a file
// uploads it straight away (no separate upload step), and anything uploaded can be viewed. Used on the
// Profile and Documents pages. `onUploaded` gets { profileVerified, documents }.
export default function DocumentList({ profile, onUploaded }) {
  const [uploading, setUploading] = useState(null); // the type being uploaded
  const [viewing, setViewing] = useState(null); // { label, doc }
  const byType = Object.fromEntries((profile.documents || []).map((d) => [d.type, d]));

  async function handleFile(d, file) {
    if (!ALLOWED_TYPES.includes(file.type) || (d.accept === 'image/*' && !file.type.startsWith('image/'))) {
      toast.error(d.accept === 'image/*' ? 'Choose a photo (JPEG, PNG or WebP)' : 'Choose a photo or a PDF');
      return;
    }
    setUploading(d.type);
    try {
      const small = await compressImage(file);
      if (small.size > MAX_BYTES) {
        toast.error('This file is too large — the maximum is 2 MB');
        return;
      }
      const result = await uploadDocuments({ [d.type]: small });
      toast.success(`${d.label} uploaded. We'll review it shortly.`);
      onUploaded(result);
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setUploading(null);
    }
  }

  return (
    <>
      <div className="divide-y divide-dashed divide-slate-200">
        {DOCUMENTS.map((d) => {
          const doc = byType[d.type];
          const Icon = DOCUMENT_ICONS[d.type];
          const busy = uploading === d.type;
          const needsUpload = !doc || doc.status === 'Rejected';
          return (
            <div key={d.type} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 ring-1 ring-accent-100">
                  <Icon className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-bold text-slate-900">{d.label}</p>
                    <StatusChip status={documentStatus(doc)} />
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
                </div>
              </div>

              <div className="flex flex-shrink-0 gap-2 pl-16 sm:pl-0">
                {doc && (
                  <button
                    type="button"
                    onClick={() => setViewing({ label: d.label, doc })}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-bold text-primary transition-colors hover:border-primary-200 hover:bg-primary-50"
                  >
                    <EyeIcon className="h-4 w-4" /> View
                  </button>
                )}
                <label
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-bold transition-colors ${
                    busy ? 'cursor-wait opacity-70' : 'cursor-pointer'
                  } ${
                    needsUpload
                      ? 'bg-accent text-primary shadow-md shadow-accent/20 hover:bg-accent-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {busy ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <UploadIcon className="h-4 w-4" />
                  )}
                  {busy ? 'Uploading…' : !doc ? 'Upload' : doc.status === 'Rejected' ? 'Upload again' : 'Replace'}
                  <input
                    type="file"
                    accept={d.accept}
                    capture={d.capture}
                    className="sr-only"
                    disabled={Boolean(uploading)}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (file) handleFile(d, file);
                    }}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {viewing && <DocumentViewer label={viewing.label} doc={viewing.doc} onClose={() => setViewing(null)} />}
    </>
  );
}
