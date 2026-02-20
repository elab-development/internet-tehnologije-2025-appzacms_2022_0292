import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useSitesStore } from '../stores/useSitesStore';
import { usePagesStore } from '../stores/usePagesStore';
import { useTemplatesStore } from '../stores/useTemplatesStore';
import { useAuthStore } from '../stores/useAuthStore';

import BlockRenderer from '../components/builder/BlockRenderer';
import { getLayoutClass } from '../components/builder/templateUtils';

export default function PagePreview() {
  const { siteSlug, slug } = useParams();

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  // sites
  const sites = useSitesStore((s) => s.sites);
  const sitesLoading = useSitesStore((s) => s.loading);
  const fetchSites = useSitesStore((s) => s.fetchSites);

  // pages
  const currentPage = usePagesStore((s) => s.current);
  const pagesLoading = usePagesStore((s) => s.loading);
  const pageError = usePagesStore((s) => s.error);
  const clearPageError = usePagesStore((s) => s.clearError);
  const fetchPageBySlug = usePagesStore((s) => s.fetchPageBySlug);

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

  // učitaj page po slug-u kad imamo site
  useEffect(() => {
    if (!site?.id) return;
    clearPageError?.();
    fetchPageBySlug({ siteId: site.id, slug });
  }, [site?.id, slug, fetchPageBySlug, clearPageError]);

  const template = useMemo(() => {
    if (!currentPage?.templateId) return null;
    return templates.find((t) => t.id === currentPage.templateId) || null;
  }, [templates, currentPage?.templateId]);

  const layout = template?.config?.layout || {};
  const blocks = currentPage?.content?.blocks || [];

  const isLoading =
    (sitesLoading && !site) ||
    (templatesLoading && !templates.length) ||
    (pagesLoading && (!currentPage || currentPage.slug !== slug));

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

  if (pageError) {
    return (
      <div className='space-y-3'>
        <div className='text-lg font-semibold'>Page not found</div>
        <div className='text-sm text-gray-500'>{pageError}</div>
        <Link className='underline text-sm' to={`/${site.slug}`}>
          Back to site
        </Link>
      </div>
    );
  }

  // sigurnost: ako je current “drugi” page, tretiraj kao not found
  if (
    !currentPage ||
    currentPage.siteId !== site.id ||
    currentPage.slug !== slug
  ) {
    return (
      <div className='space-y-2'>
        <div className='text-lg font-semibold'>Page not found</div>
        <Link className='underline text-sm' to={`/${site.slug}`}>
          Back to site
        </Link>
      </div>
    );
  }

  if (currentPage.status !== 'published' && !isAdmin) {
    return (
      <div className='space-y-2'>
        <div className='text-lg font-semibold'>Not published</div>
        <div className='text-sm text-gray-500'>
          This page is still in draft.
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
        'max-w-5xl mx-auto px-4 py-10',
      )}
    >
      {/* header */}
      <div className={layout.header || 'mb-8'}>
        <div className='text-xs text-gray-500'>
          <Link className='underline' to={`/${site.slug}`}>
            {site.name}
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-gray-700'>pages</span>
          <span className='mx-2'>/</span>
          <span className='text-gray-700'>{currentPage.slug}</span>
        </div>

        <h1 className={layout.title || 'text-4xl font-bold text-gray-900 mb-4'}>
          {currentPage.title}
        </h1>

        {isAdmin && currentPage.status !== 'published' && (
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
