import { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { useSitesStore } from '../stores/useSitesStore';
import { usePagesStore } from '../stores/usePagesStore';
import { usePostsStore } from '../stores/usePostsStore';
import { useAuthStore } from '../stores/useAuthStore';

export default function SiteHome() {
  const { siteSlug } = useParams();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const isLoggedIn = !!user;

  const sites = useSitesStore((s) => s.sites);
  const sitesLoading = useSitesStore((s) => s.loading);
  const fetchSites = useSitesStore((s) => s.fetchSites);

  const pages = usePagesStore((s) => s.pages);
  const pagesLoading = usePagesStore((s) => s.loading);
  const fetchPages = usePagesStore((s) => s.fetchPages);

  const posts = usePostsStore((s) => s.posts);
  const postsLoading = usePostsStore((s) => s.loading);
  const fetchPosts = usePostsStore((s) => s.fetchPosts);

  useEffect(() => {
    if (!sites.length) fetchSites();
  }, [sites.length, fetchSites]);

  const site = useMemo(
    () => sites.find((x) => x.slug === siteSlug),
    [sites, siteSlug],
  );

  // kad imamo site, povuci pages+posts za taj site
  useEffect(() => {
    if (!site?.id) return;
    fetchPages({ siteId: site.id });
    fetchPosts({ siteId: site.id });
  }, [site?.id, fetchPages, fetchPosts]);

  if (sitesLoading && !site)
    return <div className='text-sm text-gray-500'>Loading...</div>;

  if (!site) {
    return (
      <div className='space-y-2'>
        <div className='text-lg font-semibold'>Site not found</div>
        <Link className='underline text-sm' to='/'>
          Back to Home
        </Link>
      </div>
    );
  }

  const pagesForSite = pages.filter((p) => p.siteId === site.id);
  const postsForSite = posts.filter((p) => p.siteId === site.id);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold'>{site.name}</h1>
          <div className='text-sm text-gray-500'>/{site.slug}</div>
        </div>

        <div className='flex items-center gap-2'>
          {isAdmin && (
            <button
              onClick={() => navigate(`/${site.slug}/pages/new`)}
              className='px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800'
            >
              + Create Page
            </button>
          )}

          {isLoggedIn && (
            <button
              onClick={() => navigate(`/${site.slug}/posts/new`)}
              className='px-4 py-2 rounded border hover:bg-gray-50'
            >
              + Create Post
            </button>
          )}
        </div>
      </div>

      {/* Pages */}
      <section className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Pages</h2>
          <div className='text-xs text-gray-500'>
            {pagesForSite.length} total
          </div>
        </div>

        {pagesLoading ? (
          <div className='text-sm text-gray-500'>Loading pages...</div>
        ) : pagesForSite.length === 0 ? (
          <div className='text-sm text-gray-500'>No pages yet.</div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            {pagesForSite.map((p) => (
              <div key={p.id} className='rounded border p-4 hover:bg-gray-50'>
                <div className='text-sm font-semibold'>{p.title}</div>
                <div className='text-xs text-gray-500 mt-1'>/{p.slug}</div>
                <div className='text-xs text-gray-500 mt-2'>
                  Status: <span className='font-medium'>{p.status}</span>
                </div>

                <div className='mt-3 flex items-center gap-3'>
                  {isAdmin ? (
                    <button
                      className='text-sm underline'
                      onClick={() => navigate(`/pages/${p.id}/edit`)}
                      type='button'
                    >
                      Edit
                    </button>
                  ) : (
                    <span className='text-xs text-gray-400'>
                      Admin only edit
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Posts */}
      <section className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Posts</h2>
          <div className='text-xs text-gray-500'>
            {postsForSite.length} total
          </div>
        </div>

        {postsLoading ? (
          <div className='text-sm text-gray-500'>Loading posts...</div>
        ) : postsForSite.length === 0 ? (
          <div className='text-sm text-gray-500'>No posts yet.</div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            {postsForSite.map((p) => (
              <div key={p.id} className='rounded border p-4 hover:bg-gray-50'>
                <div className='text-sm font-semibold'>{p.title}</div>
                <div className='text-xs text-gray-500 mt-1'>/{p.slug}</div>
                <div className='text-xs text-gray-500 mt-2'>
                  Status: <span className='font-medium'>{p.status}</span>
                </div>

                <div className='mt-3 flex items-center gap-3'>
                  {isLoggedIn ? (
                    <button
                      className='text-sm underline'
                      onClick={() => navigate(`/posts/${p.id}/edit`)}
                      type='button'
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      className='text-sm underline'
                      onClick={() => navigate('/auth/login')}
                      type='button'
                    >
                      Login to edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
