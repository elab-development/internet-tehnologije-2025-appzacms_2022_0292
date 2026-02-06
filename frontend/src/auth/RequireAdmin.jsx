import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export function RequireAdmin() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) return <div className='p-6'>Loading...</div>;

  if (!user) return <Navigate to='/auth/login' replace />;

  if (user.role !== 'admin') return <Navigate to='/auth/guard' replace />;

  return <Outlet />;
}
