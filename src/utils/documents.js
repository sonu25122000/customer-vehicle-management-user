// Verification documents a customer uploads (backend: PORTAL_DOCUMENT_TYPES in portalController.js).
// The Aadhaar card is two uploads: front and back.
export const DOCUMENTS = [
  { type: 'aadhaar', label: 'Aadhaar Card (Front)', accept: 'image/*,application/pdf', hint: 'The side with your photo' },
  { type: 'aadhaarBack', label: 'Aadhaar Card (Back)', accept: 'image/*,application/pdf', hint: 'The side with your address' },
  { type: 'drivingLicence', label: 'Driving License', accept: 'image/*,application/pdf' },
  { type: 'selfie', label: 'Selfie', accept: 'image/*', capture: 'user', hint: 'Be in a well lit place to click and upload' },
];

// Each document is reviewed on its own. `doc` is the profile's entry for that type (or undefined if
// it hasn't been uploaded). Returns the StatusChip status.
export function documentStatus(doc) {
  if (!doc) return 'Not Uploaded';
  if (doc.status === 'Approved') return 'Verified';
  if (doc.status === 'Rejected') return 'Rejected';
  return 'In Review';
}

// The overall picture for messages: what's missing, rejected or waiting.
export function verificationSummary(profile) {
  const byType = Object.fromEntries((profile?.documents || []).map((d) => [d.type, d]));
  const missing = DOCUMENTS.filter((d) => !byType[d.type]);
  const rejected = DOCUMENTS.filter((d) => byType[d.type]?.status === 'Rejected');
  const inReview = DOCUMENTS.filter((d) => byType[d.type] && !['Approved', 'Rejected'].includes(byType[d.type].status));
  const approved = DOCUMENTS.filter((d) => byType[d.type]?.status === 'Approved');
  return { byType, missing, rejected, inReview, approved, verified: profile?.profileVerified === 'Accepted' };
}

// One line telling the customer where their verification stands and what to do next.
export function verificationMessage(summary) {
  if (summary.verified) return 'Your profile is verified. You can start your trips.';
  if (summary.rejected.length) {
    return `Please upload your ${summary.rejected.map((d) => d.label).join(', ')} again — ${summary.rejected.length === 1 ? 'it was' : 'they were'} not accepted.`;
  }
  if (summary.missing.length) {
    return `Upload your ${summary.missing.map((d) => d.label).join(', ')} to get your profile verified. You can start a trip once it's verified.`;
  }
  return "Thanks! Your documents are being reviewed. You'll be able to start your trip as soon as they're approved.";
}

// <img>/<a> URL for one of the signed-in customer's own uploaded documents.
export function documentFileUrl(doc) {
  return `/api/portal/documents/${doc._id}/file`;
}

export const isPdf = (doc) => /\.pdf$/i.test(doc?.fileName || '');
