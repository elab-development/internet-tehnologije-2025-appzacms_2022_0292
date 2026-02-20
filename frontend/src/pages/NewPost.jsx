import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSitesStore } from '../stores/useSitesStore';
import { usePostsStore } from '../stores/usePostsStore';
import { useTemplatesStore } from '../stores/useTemplatesStore';
import { useAuthStore } from '../stores/useAuthStore';
import BuilderCanvas from '../components/builder/BuilderCanvas';

export default function NewPost() {
  const { siteSlug } = useParams();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;

  const sites = useSitesStore((s) => s.sites);
  const fetchSites = useSitesStore((s) => s.fetchSites);

  const createPost = usePostsStore((s) => s.createPost);
  const loading = usePostsStore((s) => s.loading);
  const error = usePostsStore((s) => s.error);
  const clearError = usePostsStore((s) => s.clearError);

  const templates = useTemplatesStore((s) => s.templates);
  const fetchTemplates = useTemplatesStore((s) => s.fetchTemplates);

  useEffect(() => {
    if (!sites.length) fetchSites();
    if (!templates.length) fetchTemplates();
  }, [sites.length, fetchSites, templates.length, fetchTemplates]);

  const site = useMemo(
    () => sites.find((x) => x.slug === siteSlug),
    [sites, siteSlug],
  );

  const postTemplates = useMemo(
    () => templates.filter((t) => t.type === 'post' || t.type === 'both'),
    [templates],
  );

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('draft');
  const [templateId, setTemplateId] = useState('');

  const selectedTemplate = useMemo(() => {
    const tid = templateId ? Number(templateId) : null;
    if (!tid) return null;
    return templates.find((t) => t.id === tid) || null;
  }, [templateId, templates]);

  const [content, setContent] = useState({ version: 1, blocks: [] });

  useEffect(() => {
    if (!selectedTemplate) {
      setContent({ version: 1, blocks: [] });
      return;
    }

    const defaults = selectedTemplate?.config?.blocks?.default || [];
    const withIds = defaults.map((b, idx) => ({
      id: `d${idx + 1}-${Date.now()}`,
      type: b.type,
      props: b.props || {},
    }));
    setContent({ version: 1, blocks: withIds });
  }, [selectedTemplate]);

  if (!isLoggedIn) {
    return (
      <div className='space-y-2'>
        <div className='text-lg font-semibold'>Login required</div>
        <div className='text-sm text-gray-500'>
          You must be logged in to create a post.
        </div>
        <Link className='underline text-sm' to='/auth/login'>
          Go to login
        </Link>
      </div>
    );
  }

  if (!site) return <div className='text-sm text-gray-500'>Loading...</div>;

  const onSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const payload = {
      siteId: site.id,
      title: title.trim(),
      slug: slug.trim() || undefined,
      status,
      templateId: templateId ? Number(templateId) : null,
      content, // ✅ šaljemo
    };

    await createPost(payload);
    navigate(`/${site.slug}`, { replace: true });
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Create Post</h1>
        <div className='text-sm text-gray-500'>
          Site: {site.name} (/{site.slug})
        </div>
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
            placeholder='e.g. My first post'
          />
        </div>

        <div className='space-y-1'>
          <label className='text-sm font-medium'>Slug (optional)</label>
          <input
            className='w-full border rounded px-3 py-2'
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder='e.g. my-first-post'
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
            <label className='text-sm font-medium'>Template (optional)</label>
            <select
              className='w-full border rounded px-3 py-2 bg-white'
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              <option value=''>No template</option>
              {postTemplates.map((t) => (
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
            onClick={() => navigate(`/${site.slug}`)}
            className='px-4 py-2 rounded border hover:bg-gray-50'
          >
            Cancel
          </button>
          <button
            disabled={loading || !title.trim()}
            className='px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50'
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>

      <div className='space-y-2'>
        <div className='text-sm font-medium'>Content builder</div>
        {!selectedTemplate ? (
          <div className='text-sm text-gray-500'>
            Select a template to see allowed blocks and defaults.
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
