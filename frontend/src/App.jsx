import { useEffect } from 'react';
import { useAuthStore } from './stores/useAuthStore';

export default function App() {
  const me = useAuthStore((s) => s.me);

  useEffect(() => {
    me();
  }, [me]);

  return <div>CMS</div>;
}
