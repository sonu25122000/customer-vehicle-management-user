import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { uploadDocuments } from '../api/portal';
import { errorMessage } from '../api/client';
import { compressImage } from '../utils/compressImage';
import { DOCUMENTS } from '../utils/documents';
import { UploadIcon, CheckIcon } from './icons';

// Upload one or more verification documents. `only` limits it to some types (e.g. re-uploading just a
// rejected one). Only the documents uploaded here go back for review — approved ones stay approved.
export default function DocumentUploadModal({ onClose, onUploaded, onFile = [], only }) {
  const [files, setFiles] = useState({});
  const [uploading, setUploading] = useState(false);
  const selected = Object.values(files).filter(Boolean).length;
  const documents = only ? DOCUMENTS.filter((d) => only.includes(d.type)) : DOCUMENTS;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected) {
      toast.error('Choose at least one document');
      return;
    }
    setUploading(true);
    try {
      const compressed = Object.fromEntries(
        await Promise.all(Object.entries(files).map(async ([type, file]) => [type, file && (await compressImage(file))]))
      );
      const result = await uploadDocuments(compressed);
      toast.success('Uploaded. We will review it shortly.');
      onUploaded(result);
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal title={documents.length === 1 ? `Upload ${documents[0].label}` : 'Upload verification documents'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <p className="text-xs text-slate-500">
          Upload a clear photo (or PDF). Each document is reviewed on its own — uploading one again only sends that
          document for review; the ones already verified stay verified.
        </p>
        {documents.map((d) => {
          const file = files[d.type];
          return (
            <label
              key={d.type}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3 transition-colors ${
                file ? 'border-accent-300 bg-accent-50' : 'border-slate-300 hover:border-accent-300 hover:bg-slate-50'
              }`}
            >
              <span
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${file ? 'bg-accent text-primary' : 'bg-slate-100 text-slate-500'}`}
              >
                {file ? <CheckIcon className="h-4 w-4" /> : <UploadIcon className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">
                  {d.label}
                  {onFile.includes(d.type) && <span className="ml-2 text-xs font-normal text-slate-400">(replaces the current one)</span>}
                </span>
                <span className="block truncate text-xs text-slate-500">{file ? file.name : d.hint || 'Tap to choose a file'}</span>
              </span>
              <input
                type="file"
                accept={d.accept}
                capture={d.capture}
                className="sr-only"
                onChange={(e) => setFiles((f) => ({ ...f, [d.type]: e.target.files?.[0] || null }))}
              />
            </label>
          );
        })}
        <button
          type="submit"
          disabled={uploading}
          className="mt-2 w-full cursor-pointer rounded-lg bg-accent px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-accent-600 disabled:cursor-wait disabled:opacity-60"
        >
          {uploading ? 'Uploading...' : `Upload${selected ? ` (${selected})` : ''}`}
        </button>
      </form>
    </Modal>
  );
}
