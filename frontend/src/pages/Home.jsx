import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className='min-h-screen p-6'>
      <div className='max-w-3xl mx-auto space-y-4'>
        <h1 className='text-2xl font-semibold'>CMS Home</h1>

        {user ? (
          <div className='space-y-2'>
            <div className='text-sm'>
              Logged in as <span className='font-medium'>{user.name}</span> (
              {user.role})
            </div>
            <button
              className='px-4 py-2 rounded bg-black text-white'
              onClick={logout}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className='space-x-3'>
            <Link className='underline' to='/auth/login'>
              Login
            </Link>
            <Link className='underline' to='/auth/register'>
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
