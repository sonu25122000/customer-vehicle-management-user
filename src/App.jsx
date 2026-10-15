import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageLayout from './components/PageLayout';
import { WhatsAppFab } from './components/WhatsAppButton';
import HomePage from './pages/HomePage';
import { LoginPage, SignupPage, ChangePasswordPage } from './pages/AuthPages';
import ProfilePage from './pages/ProfilePage';
import DocumentsPage from './pages/DocumentsPage';
import TripsPage from './pages/TripsPage';
import TripOtpPage from './pages/TripOtpPage';
import CarsPage from './pages/CarsPage';
import CarDetailPage from './pages/CarDetailPage';
import { usePageViews } from './utils/analytics';
import BookPage from './pages/BookPage';
import { BOOKING_ENABLED } from './utils/features';

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  const { checking } = useAuth();
  const { pathname } = useLocation();
  usePageViews();

  if (checking) {
    return <div className="flex h-dvh items-center justify-center text-sm text-slate-500">Loading...</div>;
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontSize: '0.875rem' },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route element={<PageLayout />}>
          {/* Open to everyone — no login needed to browse cars. */}
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/cars/:id" element={<CarDetailPage />} />
          {/* Online booking is hidden unless VITE_ENABLE_BOOKING=true (utils/features.js). */}
          <Route
            path="/book"
            element={
              BOOKING_ENABLED ? (
                <Protected>
                  <BookPage />
                </Protected>
              ) : (
                <Navigate to="/cars" replace />
              )
            }
          />
          <Route
            path="/trips"
            element={
              <Protected>
                <TripsPage />
              </Protected>
            }
          />
          <Route
            path="/trips/:id/start"
            element={
              <Protected>
                <TripOtpPage key="start" mode="start" />
              </Protected>
            }
          />
          <Route
            path="/trips/:id/end"
            element={
              <Protected>
                <TripOtpPage key="end" mode="end" />
              </Protected>
            }
          />
          <Route
            path="/documents"
            element={
              <Protected>
                <DocumentsPage />
              </Protected>
            }
          />
          <Route
            path="/profile"
            element={
              <Protected>
                <ProfilePage />
              </Protected>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <WhatsAppFab hideOnPhone={pathname.startsWith('/book')} />
    </>
  );
}
