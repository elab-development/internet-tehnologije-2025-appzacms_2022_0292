import { create } from 'zustand';
import { api } from '../lib/api';

export const useSitesStore = create((set, get) => ({
  sites: [],
  current: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchSites: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get('/api/sites');
      set({ sites: data.sites, loading: false });
      return data.sites;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  fetchSite: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await api.get(`/api/sites/${id}`);
      set({ current: data.site, loading: false });
      return data.site;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  createSite: async ({ name, slug, config }) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/api/sites', { name, slug, config });
      set((s) => ({ sites: [data.site, ...s.sites], loading: false }));
      return data.site;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  updateSite: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const data = await api.put(`/api/sites/${id}`, payload);
      set((s) => ({
        sites: s.sites.map((x) => (x.id === id ? data.site : x)),
        current: s.current?.id === id ? data.site : s.current,
        loading: false,
      }));
      return data.site;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  deleteSite: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.del(`/api/sites/${id}`);
      set((s) => ({
        sites: s.sites.filter((x) => x.id !== id),
        current: s.current?.id === id ? null : s.current,
        loading: false,
      }));
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },
}));
