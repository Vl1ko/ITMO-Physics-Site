import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { Role } from '../types';

export function ProtectedRoute({ role }: { role: Role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <section className="container">
        <p className="muted">Загрузка...</p>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user.role !== role) {
    return (
      <section className="container">
        <div className="alert alert-err">Недостаточно прав для просмотра этого раздела.</div>
      </section>
    );
  }

  return <Outlet />;
}
