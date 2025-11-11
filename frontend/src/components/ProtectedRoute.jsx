import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, roles }) {
  const { isLogged, hasRole } = useAuth();
  if (!isLogged) return <Navigate to="/login" replace />;
  if (roles && !roles.some(hasRole)) return <Navigate to="/" replace />;
  return children;
}
