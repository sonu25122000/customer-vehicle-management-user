import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { rateTrip } from '../api/portal';
import { errorMessage } from '../api/client';
import { vehicleName } from '../utils/format';
import { StarIcon } from './icons';

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

// After a completed trip the customer rates the car once (1–5 stars, optional comment).
export default function RateTripModal({ trip, onClose, onRated }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [saving, setSaving] = useState(false);
  const shown = hover || rating;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) {
      toast.error('Tap a star to rate');
      return;
    }
    setSaving(true);
    try {
      const res = await rateTrip(trip._id, rating, review.trim());
      toast.success(res.message || 'Thanks for your rating!');
      onRated(res.data);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save your rating'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Rate your ride" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <p className="text-center text-sm text-slate-600">
          How was the <span className="font-semibold text-slate-900">{vehicleName(trip.vehicle) || 'car'}</span> on trip{' '}
          <span className="font-mono text-xs font-semibold">{trip.tripId}</span>?
        </p>
        <div className="flex gap-1.5" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n === 1 ? '' : 's'}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className="cursor-pointer p-1 transition-transform hover:scale-110"
            >
              <StarIcon className={`h-9 w-9 ${n <= shown ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
            </button>
          ))}
        </div>
        <p className="h-5 text-sm font-semibold text-slate-700">{LABELS[shown]}</p>
        <textarea
          rows={3}
          maxLength={500}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Anything you'd like to share? (optional)"
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Submit Rating'}
        </button>
        <p className="text-xs text-slate-400">You can rate each trip once.</p>
      </form>
    </Modal>
  );
}
