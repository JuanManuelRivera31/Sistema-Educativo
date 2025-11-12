// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';

// export default function ProtectedRoute({ children, roles }) {
//   const { isLogged, hasRole } = useAuth();
//   if (!isLogged) return <Navigate to="/login" replace />;
//   if (roles && !roles.some(hasRole)) return <Navigate to="/" replace />;
//   return children;
// }

// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, roles: needed = [] }) {
  const token = localStorage.getItem('auth_token');
  if (!token) return <Navigate to="/login" replace />;

  if (needed.length > 0) {
    let roles = [];
    try { roles = JSON.parse(localStorage.getItem('auth_roles') || '[]'); }
    catch { roles = []; }
    const ok = needed.some(r => roles.includes(r));
    if (!ok) return <Navigate to="/" replace />;
  }
  return children;
}
