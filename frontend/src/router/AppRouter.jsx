import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AuthGate from '../pages/AuthGate';

import { GuestOnly } from '../auth/GuestOnly';

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/auth/guard', element: <AuthGate /> },

      {
        element: <GuestOnly />,
        children: [
          { path: '/auth/login', element: <Login /> },
          { path: '/auth/register', element: <Register /> },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
