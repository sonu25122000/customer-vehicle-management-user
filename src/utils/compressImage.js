// Client-side image compression via the Canvas API — no external dependency. Every photo uploaded from
// the site ends up at most MAX_PHOTO_BYTES (1.5 MB): anything bigger is re-encoded as JPEG at a lower
// quality, and if that isn't enough it's scaled down step by step until it fits. PDFs pass through
// untouched (they can't be compressed here; the backend caps them at 2 MB). The backend also refuses
// photos over 1.5 MB (middleware/upload.js), as a backstop.
export const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;
// Aim a little under the limit.
const TARGET_BYTES = 1.4 * 1024 * 1024;
const QUALITIES = [0.85, 0.75, 0.65, 0.55];
const SCALE_STEP = 0.8;
const MIN_DIMENSION = 480;

function toBlob(canvas, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

// The image redrawn at most `maxDimension` px on its longest side, re-encoded as JPEG under `targetBytes`.
// Returns the original file when it's already small enough, isn't an image, or the browser can't read it.
export async function compressImage(file, { maxDimension = 1920, targetBytes = TARGET_BYTES } = {}) {
  if (!file || !file.type?.startsWith('image/')) return file;
  if (file.size <= targetBytes) return file;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // unreadable here — the size check before upload decides
  }
  try {
    let dimension = Math.min(maxDimension, Math.max(bitmap.width, bitmap.height));
    let smallest = null;
    for (;;) {
      const scale = dimension / Math.max(bitmap.width, bitmap.height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of QUALITIES) {
        // eslint-disable-next-line no-await-in-loop
        const blob = await toBlob(canvas, quality);
        if (blob && (!smallest || blob.size < smallest.size)) smallest = blob;
        if (blob && blob.size <= targetBytes) {
          return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg', lastModified: Date.now() });
        }
      }
      if (dimension <= MIN_DIMENSION) break;
      dimension = Math.max(MIN_DIMENSION, Math.round(dimension * SCALE_STEP));
    }
    return smallest && smallest.size < file.size
      ? new File([smallest], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg', lastModified: Date.now() })
      : file;
  } finally {
    bitmap.close?.();
  }
}

// '' when the file can be uploaded, otherwise the message to show: photos up to 1.5 MB, PDFs up to 2 MB.
export function uploadSizeError(file) {
  const isImage = file?.type?.startsWith('image/');
  const limit = isImage ? MAX_PHOTO_BYTES : 2 * 1024 * 1024;
  if (!file || file.size <= limit) return '';
  return isImage
    ? "This photo is too large even after compressing — please use a smaller one (max 1.5 MB)."
    : 'This PDF is too large — the maximum is 2 MB.';
}
