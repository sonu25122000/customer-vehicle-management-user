import { AlertIcon, CheckIcon, ClockIcon, RouteIcon, UploadIcon, XIcon } from './icons';

const STYLES = {
  Pending: { className: 'bg-amber-50 text-amber-700 ring-amber-200', Icon: AlertIcon },
  'Not Uploaded': { className: 'bg-slate-50 text-slate-600 ring-slate-200', Icon: UploadIcon },
  'In Review': { className: 'bg-primary-50 text-primary ring-primary-200', Icon: ClockIcon },
  Verified: { className: 'bg-emerald-50 text-emerald-700 ring-emerald-200', Icon: CheckIcon },
  Rejected: { className: 'bg-red-50 text-red-700 ring-red-200', Icon: XIcon },
  // Trip statuses (same colours as the admin portal's TripStatusBadge family)
  'Yet to Start': { className: 'bg-primary-50 text-primary ring-primary-200', Icon: ClockIcon },
  'On Trip': { className: 'bg-accent-50 text-accent-800 ring-accent-200', Icon: RouteIcon },
  Completed: { className: 'bg-emerald-50 text-emerald-700 ring-emerald-200', Icon: CheckIcon },
  Cancelled: { className: 'bg-red-50 text-red-700 ring-red-200', Icon: XIcon },
};

export default function StatusChip({ status, label }) {
  const style = STYLES[status] || STYLES.Pending;
  const Icon = style.Icon;
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold ring-1 ${style.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label || status}
    </span>
  );
}
