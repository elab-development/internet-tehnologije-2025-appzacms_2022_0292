import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AuthGate from '../pages/AuthGate';
import SiteHome from '../pages/SiteHome';

import NewPage from '../pages/NewPage';
import NewPost from '../pages/NewPost';
import EditPage from '../pages/EditPage';
import EditPost from '../pages/EditPost';

import PagePreview from '../pages/PagePreview';
import PostPreview from '../pages/PostPreview';

import { GuestOnly } from '../auth/GuestOnly';
import { RequireAuth } from '../auth/RequireAuth';
import { RequireAdmin } from '../auth/RequireAdmin';

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },

      { path: '/auth/guard', element: <AuthGate /> },

      { path: '/:siteSlug/pages/:slug', element: <PagePreview /> },
      { path: '/:siteSlug/posts/:slug', element: <PostPreview /> },

      { path: '/:siteSlug', element: <SiteHome /> },

      // ADMIN ONLY (pages create + edit)
      {
        element: <RequireAdmin />,
        children: [
          { path: '/:siteSlug/pages/new', element: <NewPage /> },
          { path: '/pages/:id/edit', element: <EditPage /> },
        ],
      },

      // AUTH ONLY (posts create + edit)
      {
        element: <RequireAuth />,
        children: [
          { path: '/:siteSlug/posts/new', element: <NewPost /> },
          { path: '/posts/:id/edit', element: <EditPost /> },
        ],
      },

      // GUEST ONLY
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
