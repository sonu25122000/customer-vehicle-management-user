import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { customer } = useAuth();
  const location = useLocation();
  const here = encodeURIComponent(location.pathname + location.search);
  if (!customer) {
    return <Navigate to={`/login?next=${here}`} replace />;
  }
  // A customer our team created has to set their own password before anything else.
  if (customer.mustChangePassword) {
    return <Navigate to={`/change-password?next=${here}`} replace />;
  }
  return children;
}
