import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import { usePagesStore } from '../stores/usePagesStore';
import { useTemplatesStore } from '../stores/useTemplatesStore';
import { useSitesStore } from '../stores/useSitesStore';
import { useAuthStore } from '../stores/useAuthStore';

import BuilderCanvas from '../components/builder/BuilderCanvas';

export default function EditPage() {
  const { id } = useParams();
  const pageId = Number(id);
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const fetchPage = usePagesStore((s) => s.fetchPage);
  const updatePage = usePagesStore((s) => s.updatePage);
  const current = usePagesStore((s) => s.current);
  const loading = usePagesStore((s) => s.loading);
  const error = usePagesStore((s) => s.error);
  const clearError = usePagesStore((s) => s.clearError);

  const templates = useTemplatesStore((s) => s.templates);
  const fetchTemplates = useTemplatesStore((s) => s.fetchTemplates);

  const sites = useSitesStore((s) => s.sites);
  const fetchSites = useSitesStore((s) => s.fetchSites);

  useEffect(() => {
    if (!templates.length) fetchTemplates();
    if (!sites.length) fetchSites();
  }, [templates.length, fetchTemplates, sites.length, fetchSites]);

  useEffect(() => {
    if (!pageId) return;
    fetchPage(pageId);
  }, [pageId, fetchPage]);

  const page = current?.id === pageId ? current : null;

  const site = useMemo(() => {
    if (!page?.siteId) return null;
    return sites.find((s) => s.id === page.siteId) || null;
  }, [sites, page?.siteId]);

  const pageTemplates = useMemo(
    () => templates.filter((t) => t.type === 'page' || t.type === 'both'),
    [templates],
  );

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('draft');
  const [templateId, setTemplateId] = useState('');
  const [content, setContent] = useState({ version: 1, blocks: [] });

  // init state kad stigne page
  useEffect(() => {
    if (!page) return;
    setTitle(page.title || '');
    setSlug(page.slug || '');
    setStatus(page.status || 'draft');
    setTemplateId(page.templateId ? String(page.templateId) : '');
    setContent(page.content || { version: 1, blocks: [] });
  }, [page]);

  const selectedTemplate = useMemo(() => {
    const tid = templateId ? Number(templateId) : null;
    if (!tid) return null;
    return templates.find((t) => t.id === tid) || null;
  }, [templateId, templates]);

  if (!isAdmin) {
    return (
      <div className='space-y-2'>
        <div className='text-lg font-semibold'>Forbidden</div>
        <div className='text-sm text-gray-500'>Only admin can edit pages.</div>
        <Link className='underline text-sm' to='/'>
          Back to Home
        </Link>
      </div>
    );
  }

  if (loading && !page)
    return <div className='text-sm text-gray-500'>Loading...</div>;

  if (!page) {
    return (
      <div className='space-y-2'>
        <div className='text-lg font-semibold'>Page not found</div>
        <Link className='underline text-sm' to='/'>
          Back to Home
        </Link>
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      status,
      templateId: templateId ? Number(templateId) : null,
      content,
    };

    const updated = await updatePage(pageId, payload);
    // vrati na sajt
    if (site?.slug) navigate(`/${site.slug}`, { replace: true });
    return updated;
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-semibold'>Edit Page</h1>
          <div className='text-sm text-gray-500'>
            {site
              ? `Site: ${site.name} (/${site.slug})`
              : `Site ID: ${page.siteId}`}
          </div>
        </div>

        {site?.slug && (
          <button
            type='button'
            onClick={() => navigate(`/${site.slug}`)}
            className='px-4 py-2 rounded border hover:bg-gray-50'
          >
            Back
          </button>
        )}
      </div>

      {error && (
        <div className='p-3 rounded border border-red-200 bg-red-50 text-red-800 text-sm'>
          {error}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className='space-y-3 rounded border p-4 max-w-2xl'
      >
        <div className='space-y-1'>
          <label className='text-sm font-medium'>Title *</label>
          <input
            className='w-full border rounded px-3 py-2'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className='space-y-1'>
          <label className='text-sm font-medium'>Slug</label>
          <input
            className='w-full border rounded px-3 py-2'
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
          <div className='space-y-1'>
            <label className='text-sm font-medium'>Status</label>
            <select
              className='w-full border rounded px-3 py-2 bg-white'
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value='draft'>draft</option>
              <option value='published'>published</option>
            </select>
          </div>

          <div className='sm:col-span-2 space-y-1'>
            <label className='text-sm font-medium'>Template</label>
            <select
              className='w-full border rounded px-3 py-2 bg-white'
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              <option value=''>No template</option>
              {pageTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (#{t.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='pt-2 flex items-center justify-end gap-2'>
          <button
            type='button'
            onClick={() => {
              if (site?.slug) navigate(`/${site.slug}`);
              else navigate('/');
            }}
            className='px-4 py-2 rounded border hover:bg-gray-50'
          >
            Cancel
          </button>

          <button
            disabled={loading || !title.trim()}
            className='px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50'
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>

      <div className='space-y-2'>
        <div className='text-sm font-medium'>Content builder</div>
        {!selectedTemplate ? (
          <div className='text-sm text-gray-500'>
            Select a template to limit allowed blocks. (You can still edit
            content without it.)
          </div>
        ) : (
          <BuilderCanvas
            template={selectedTemplate}
            value={content}
            onChange={setContent}
          />
        )}
      </div>
    </div>
  );
}
