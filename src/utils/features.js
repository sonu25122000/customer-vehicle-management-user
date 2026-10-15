// Online booking ("Book a Car") is hidden unless VITE_ENABLE_BOOKING=true — trips are booked by the
// team for now. The backend has a matching switch (ENABLE_PORTAL_BOOKING) that refuses bookings too.
export const BOOKING_ENABLED = import.meta.env.VITE_ENABLE_BOOKING === 'true';
