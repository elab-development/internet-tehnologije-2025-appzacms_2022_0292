import { useMemo, useState } from 'react';
import { useSitesStore } from '../stores/useSitesStore';

function slugify(str) {
  return (str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function CreateSiteModal({ open, onClose }) {
  const createSite = useSitesStore((s) => s.createSite);
  const loading = useSitesStore((s) => s.loading);
  const error = useSitesStore((s) => s.error);
  const clearError = useSitesStore((s) => s.clearError);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const previewSlug = useMemo(() => {
    if (slug.trim()) return slugify(slug);
    return slugify(name);
  }, [name, slug]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    clearError();

    const finalSlug = previewSlug;
    if (!name.trim()) return;

    await createSite({ name: name.trim(), slug: finalSlug, config: null });
    setName('');
    setSlug('');
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50'>
      {/* overlay */}
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />

      {/* modal */}
      <div className='relative min-h-screen flex items-center justify-center p-4'>
        <div className='w-full max-w-md rounded-lg bg-white border shadow-sm'>
          <div className='p-4 border-b flex items-center justify-between'>
            <div>
              <div className='text-lg font-semibold'>Create site</div>
              <div className='text-xs text-gray-500'>Admin only</div>
            </div>
            <button
              className='h-9 w-9 rounded hover:bg-gray-100'
              onClick={onClose}
              aria-label='Close'
            >
              ✕
            </button>
          </div>

          <form onSubmit={submit} className='p-4 space-y-3'>
            {error && (
              <div className='p-3 rounded border border-red-200 bg-red-50 text-red-800 text-sm'>
                {error}
              </div>
            )}

            <div className='space-y-1'>
              <label className='text-sm font-medium'>Name</label>
              <input
                className='w-full border rounded px-3 py-2'
                placeholder='e.g. FON CMS'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className='text-xs text-gray-500'>Required</div>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-medium'>Slug (optional)</label>
              <input
                className='w-full border rounded px-3 py-2'
                placeholder='e.g. fon-cms'
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <div className='text-xs text-gray-500'>
                Final slug:{' '}
                <span className='font-medium'>/{previewSlug || '-'}</span>
              </div>
            </div>

            <div className='pt-2 flex items-center justify-end gap-2'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 rounded border hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                disabled={loading || !name.trim()}
                className='px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50'
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
