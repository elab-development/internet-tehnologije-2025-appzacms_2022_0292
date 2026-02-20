import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiHome,
  FiLogIn,
  FiUserPlus,
  FiLogOut,
  FiUser,
  FiBarChart2,
} from 'react-icons/fi';
import { useAuthStore } from '../stores/useAuthStore';

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex items-center gap-2 rounded px-3 py-2 text-sm',
          isActive
            ? 'bg-gray-900 text-white'
            : 'text-gray-700 hover:bg-gray-100',
        ].join(' ')
      }
    >
      <Icon className='text-base' />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const close = () => setOpen(false);

  const handleLogout = async () => {
    await logout();
    close();
    navigate('/', { replace: true });
  };

  return (
    <header className='sticky top-0 z-50 border-b bg-white/90 backdrop-blur'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='h-14 flex items-center justify-between'>
          {/* Brand */}
          <Link to='/' className='flex items-center gap-2'>
            <div className='h-9 w-9 rounded-lg bg-gray-900 text-white flex items-center justify-center font-semibold'>
              CMS
            </div>
            <div className='leading-tight'>
              <div className='text-sm font-semibold'>CMS Platform</div>
              <div className='text-xs text-gray-500'>Flask + React</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className='hidden md:flex items-center gap-2'>
            <NavItem to='/' icon={FiHome} label='Home' />

            {!user ? (
              <>
                <NavItem to='/auth/login' icon={FiLogIn} label='Login' />
                <NavItem
                  to='/auth/register'
                  icon={FiUserPlus}
                  label='Register'
                />
              </>
            ) : (
              <>
                <div className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700'>
                  <FiUser className='text-base' />
                  <span className='font-medium'>{user.name}</span>
                  <span className='text-gray-400'>•</span>
                  <span className='text-gray-500'>{user.role}</span>
                </div>

                {user?.role === 'admin' && (
                  <NavItem to='/admin' icon={FiBarChart2} label='Admin' />
                )}

                <button
                  onClick={handleLogout}
                  className='flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100'
                >
                  <FiLogOut className='text-base' />
                  Logout
                </button>
              </>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            className='md:hidden inline-flex items-center justify-center h-10 w-10 rounded hover:bg-gray-100'
            onClick={() => setOpen((v) => !v)}
            aria-label='Toggle menu'
          >
            {open ? (
              <FiX className='text-xl' />
            ) : (
              <FiMenu className='text-xl' />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className='md:hidden pb-4'>
            <div className='pt-2 flex flex-col gap-2'>
              <NavItem to='/' icon={FiHome} label='Home' onClick={close} />

              {!user ? (
                <>
                  <NavItem
                    to='/auth/login'
                    icon={FiLogIn}
                    label='Login'
                    onClick={close}
                  />
                  <NavItem
                    to='/auth/register'
                    icon={FiUserPlus}
                    label='Register'
                    onClick={close}
                  />
                </>
              ) : (
                <>
                  <div className='rounded border p-3'>
                    <div className='text-sm font-medium'>{user.name}</div>
                    <div className='text-xs text-gray-500'>{user.email}</div>
                    <div className='mt-1 text-xs text-gray-500'>
                      Role: {user.role}
                    </div>
                  </div>

                  {user?.role === 'admin' && (
                    <NavItem
                      to='/admin'
                      icon={FiBarChart2}
                      label='Admin'
                      onClick={close}
                    />
                  )}

                  <button
                    onClick={handleLogout}
                    className='flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left'
                  >
                    <FiLogOut className='text-base' />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
