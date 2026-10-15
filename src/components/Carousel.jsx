import { useRef, useState } from 'react';
import { vehiclePhotoUrl } from '../api/portal';
import { CarIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

// Photo carousel for a car: arrows, dots and swipe. `photos` are { _id, slot } from the API.
export default function Carousel({ photos = [], alt = '', className = 'aspect-[16/10]' }) {
  const [index, setIndex] = useState(0);
  const touchX = useRef(null);
  const count = photos.length;

  if (!count) {
    return (
      <div className={`flex w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 ${className}`}>
        <CarIcon className="h-14 w-14 text-slate-400" />
      </div>
    );
  }

  const current = Math.min(index, count - 1);
  function go(delta, e) {
    e?.stopPropagation();
    e?.preventDefault();
    setIndex((current + delta + count) % count);
  }

  return (
    <div
      className={`group relative w-full overflow-hidden bg-slate-100 ${className}`}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {photos.map((p, i) => (
          <img
            key={p._id}
            src={vehiclePhotoUrl(p._id)}
            alt={`${alt} photo ${i + 1}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="h-full w-full flex-shrink-0 object-cover"
          />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => go(-1, e)}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => go(1, e)}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {photos.map((p, i) => (
              <button
                key={p._id}
                type="button"
                aria-label={`Show photo ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIndex(i);
                }}
                className={`h-1.5 cursor-pointer rounded-full transition-all ${i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
