import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useSitesStore } from '../stores/useSitesStore';
import { usePostsStore } from '../stores/usePostsStore';
import { useTemplatesStore } from '../stores/useTemplatesStore';
import { useAuthStore } from '../stores/useAuthStore';

import BlockRenderer from '../components/builder/BlockRenderer';
import { getLayoutClass } from '../components/builder/templateUtils';

export default function PostPreview() {
  const { siteSlug, slug } = useParams();

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  // sites
  const sites = useSitesStore((s) => s.sites);
  const sitesLoading = useSitesStore((s) => s.loading);
  const fetchSites = useSitesStore((s) => s.fetchSites);

  // posts
  const currentPost = usePostsStore((s) => s.current);
  const postsLoading = usePostsStore((s) => s.loading);
  const postError = usePostsStore((s) => s.error);
  const clearPostError = usePostsStore((s) => s.clearError);
  const fetchPostBySlug = usePostsStore((s) => s.fetchPostBySlug);

  // templates
  const templates = useTemplatesStore((s) => s.templates);
  const templatesLoading = useTemplatesStore((s) => s.loading);
  const fetchTemplates = useTemplatesStore((s) => s.fetchTemplates);

  useEffect(() => {
    if (!sites.length) fetchSites();
    if (!templates.length) fetchTemplates();
  }, [sites.length, fetchSites, templates.length, fetchTemplates]);

  const site = useMemo(
    () => sites.find((x) => x.slug === siteSlug),
    [sites, siteSlug],
  );

  // učitaj post po slug-u kad imamo site
  useEffect(() => {
    if (!site?.id) return;
    clearPostError?.();
    fetchPostBySlug({ siteId: site.id, slug });
  }, [site?.id, slug, fetchPostBySlug, clearPostError]);

  const template = useMemo(() => {
    if (!currentPost?.templateId) return null;
    return templates.find((t) => t.id === currentPost.templateId) || null;
  }, [templates, currentPost?.templateId]);

  const layout = template?.config?.layout || {};
  const blocks = currentPost?.content?.blocks || [];

  const isLoading =
    (sitesLoading && !site) ||
    (templatesLoading && !templates.length) ||
    (postsLoading && (!currentPost || currentPost.slug !== slug));

  if (isLoading) return <div className='text-sm text-gray-500'>Loading...</div>;

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

  if (postError) {
    return (
      <div className='space-y-3'>
        <div className='text-lg font-semibold'>Post not found</div>
        <div className='text-sm text-gray-500'>{postError}</div>
        <Link className='underline text-sm' to={`/${site.slug}`}>
          Back to site
        </Link>
      </div>
    );
  }

  if (
    !currentPost ||
    currentPost.siteId !== site.id ||
    currentPost.slug !== slug
  ) {
    return (
      <div className='space-y-2'>
        <div className='text-lg font-semibold'>Post not found</div>
        <Link className='underline text-sm' to={`/${site.slug}`}>
          Back to site
        </Link>
      </div>
    );
  }

  if (currentPost.status !== 'published' && !isAdmin) {
    return (
      <div className='space-y-2'>
        <div className='text-lg font-semibold'>Not published</div>
        <div className='text-sm text-gray-500'>
          This post is still in draft.
        </div>
        <Link className='underline text-sm' to={`/${site.slug}`}>
          Back to site
        </Link>
      </div>
    );
  }

  return (
    <div
      className={getLayoutClass(
        template,
        'container',
        'max-w-3xl mx-auto px-4 py-10',
      )}
    >
      {/* header */}
      <div className={layout.header || 'mb-6'}>
        <div className='text-xs text-gray-500'>
          <Link className='underline' to={`/${site.slug}`}>
            {site.name}
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-gray-700'>posts</span>
          <span className='mx-2'>/</span>
          <span className='text-gray-700'>{currentPost.slug}</span>
        </div>

        <h1 className={layout.title || 'text-3xl font-bold text-gray-900 mb-2'}>
          {currentPost.title}
        </h1>

        <div className={layout.meta || 'text-sm text-gray-500 mb-6'}>
          <span>Author ID: {currentPost.authorId}</span>
          <span className='mx-2'>•</span>
          <span>Status: {currentPost.status}</span>
        </div>

        {isAdmin && currentPost.status !== 'published' && (
          <div className='inline-flex items-center text-xs rounded border px-2 py-1 bg-yellow-50 border-yellow-200 text-yellow-800'>
            DRAFT (admin preview)
          </div>
        )}
      </div>

      {/* content */}
      <div className={layout.content || 'prose max-w-none'}>
        {blocks.length === 0 ? (
          <div className='text-sm text-gray-500'>No content yet.</div>
        ) : (
          <div className='space-y-4'>
            {blocks.map((b) => (
              <BlockRenderer key={b.id} template={template} block={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
