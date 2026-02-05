import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function AuthGate() {
  const navigate = useNavigate();
  const me = useAuthStore((s) => s.me);

  useEffect(() => {
    (async () => {
      const u = await me();
      if (u) navigate('/', { replace: true });
      else navigate('/auth/login', { replace: true });
    })();
  }, [me, navigate]);

  return <div className='p-6'>Checking session...</div>;
}
