import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSitesStore } from '../stores/useSitesStore';
import { useAuthStore } from '../stores/useAuthStore';
import CreateSiteModal from '../components/CreateSiteModal';

export default function Home() {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);

  const sites = useSitesStore((s) => s.sites);
  const loading = useSitesStore((s) => s.loading);
  const error = useSitesStore((s) => s.error);
  const fetchSites = useSitesStore((s) => s.fetchSites);
  const clearError = useSitesStore((s) => s.clearError);

  const [open, setOpen] = useState(false);

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-semibold'>Sites</h1>
          <p className='text-sm text-gray-500'>
            Choose a site to open its home page.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              clearError();
              setOpen(true);
            }}
            className='px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800'
          >
            + Create site
          </button>
        )}
      </div>

      {error && (
        <div className='p-3 rounded border border-red-200 bg-red-50 text-red-800 text-sm flex items-center justify-between gap-3'>
          <span>{error}</span>
          <button className='underline' onClick={clearError}>
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className='text-sm text-gray-500'>Loading sites...</div>
      ) : sites.length === 0 ? (
        <div className='text-sm text-gray-500'>No sites yet.</div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {sites.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/${s.slug}`)}
              className='text-left rounded-lg border p-4 hover:bg-gray-50 transition'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <div className='text-lg font-semibold'>{s.name}</div>
                  <div className='text-sm text-gray-500'>/{s.slug}</div>
                </div>
                <div className='text-xs text-gray-400'>ID #{s.id}</div>
              </div>

              <div className='mt-3 text-xs text-gray-500'>
                {s.updatedAt
                  ? `Updated: ${new Date(s.updatedAt).toLocaleString()}`
                  : ''}
              </div>
            </button>
          ))}
        </div>
      )}

      {isAdmin && (
        <CreateSiteModal open={open} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
