import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

export function AuthProvider({ children }) {
  const me = useAuthStore((s) => s.me);

  useEffect(() => {
    me();
  }, [me]);

  return children;
}
