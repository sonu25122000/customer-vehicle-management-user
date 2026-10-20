import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraIcon, XIcon } from './icons';

// Photos of the guest (the verification selfie, the profile photo) are always taken live with the front
// camera (getUserMedia), on phones and computers alike — never picked from files or the gallery. Shows a
// live preview, then the shot to retake or use. onCapture gets a JPEG File.
export default function SelfieCamera({
  onCapture,
  onClose,
  title = 'Take a selfie',
  hint = 'Face the camera in a well-lit place, with your whole face in the circle.',
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [shot, setShot] = useState(null); // { url, blob } once taken
  const [error, setError] = useState('');

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setReady(false);
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser can't open the camera. Please try Chrome, Safari or Edge.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError(
        err?.name === 'NotAllowedError'
          ? 'Camera access was blocked. Allow the camera for this site (the camera icon in the address bar), then try again.'
          : err?.name === 'NotFoundError'
            ? "We couldn't find a camera on this device. Please use a phone or a computer with a camera."
            : "We couldn't open the camera. Close other apps using it and try again."
      );
    }
  }, []);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  // Escape closes; the page behind doesn't scroll.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  useEffect(() => () => shot && URL.revokeObjectURL(shot.url), [shot]);

  function takePhoto() {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setShot({ url: URL.createObjectURL(blob), blob });
        stop();
      },
      'image/jpeg',
      0.9
    );
  }

  function retake() {
    setShot(null);
    start();
  }

  function confirmPhoto() {
    onCapture(new File([shot.blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' }));
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/70 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[95dvh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-primary">{title}</h2>
            <p className="text-xs text-slate-500">{hint}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-primary-dark">
          {error ? (
            <p className="px-6 text-center text-sm text-primary-100">{error}</p>
          ) : shot ? (
            <img src={shot.url} alt="Your selfie" className="h-full w-full object-cover" />
          ) : (
            <>
              {/* Mirrored like a mirror; the photo itself is saved the right way round. */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => setReady(true)}
                className="h-full w-full scale-x-[-1] object-cover"
              />
              <span className="pointer-events-none absolute inset-[14%] rounded-full border-2 border-dashed border-white/70" />
              {!ready && <span className="absolute h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
            </>
          )}
        </div>

        <div className="flex gap-3">
          {error ? (
            <>
              <button type="button" onClick={onClose} className="flex-1 cursor-pointer rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                Close
              </button>
              <button type="button" onClick={start} className="flex-1 cursor-pointer rounded-lg bg-accent px-4 py-3 text-sm font-bold text-primary hover:bg-accent-600">
                Try again
              </button>
            </>
          ) : shot ? (
            <>
              <button type="button" onClick={retake} className="flex-1 cursor-pointer rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                Retake
              </button>
              <button type="button" onClick={confirmPhoto} className="flex-1 cursor-pointer rounded-lg bg-accent px-4 py-3 text-sm font-bold text-primary shadow-md shadow-accent/20 hover:bg-accent-600">
                Use Photo
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={takePhoto}
              disabled={!ready}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-bold text-primary shadow-md shadow-accent/20 hover:bg-accent-600 disabled:cursor-wait disabled:opacity-60"
            >
              <CameraIcon className="h-5 w-5" /> Take Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
