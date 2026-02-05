import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    clearError();
    await register({ name, email, password });
    navigate('/', { replace: true });
  };

  return (
    <div className='min-h-screen p-6'>
      <div className='max-w-md mx-auto space-y-4'>
        <h1 className='text-2xl font-semibold'>Register</h1>

        {error && (
          <div className='p-3 rounded bg-red-100 text-red-800 text-sm'>
            {error}
          </div>
        )}

        <form className='space-y-3' onSubmit={onSubmit}>
          <input
            className='w-full border rounded px-3 py-2'
            placeholder='Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className='w-full border rounded px-3 py-2'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className='w-full border rounded px-3 py-2'
            placeholder='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className='w-full px-4 py-2 rounded bg-black text-white'>
            Create account
          </button>
        </form>

        <div className='text-sm'>
          Already have an account?{' '}
          <Link className='underline' to='/auth/login'>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
