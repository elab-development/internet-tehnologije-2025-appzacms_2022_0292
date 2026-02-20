import { create } from 'zustand';
import { api } from '../lib/api';

export const usePagesStore = create((set) => ({
  pages: [],
  current: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchPages: async ({ siteId } = {}) => {
    set({ loading: true, error: null });
    try {
      const qs = siteId ? `?siteId=${siteId}` : '';
      const data = await api.get(`/api/pages${qs}`);
      set({ pages: data.pages, loading: false });
      return data.pages;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  fetchPage: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await api.get(`/api/pages/${id}`);
      set({ current: data.page, loading: false });
      return data.page;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  fetchPageBySlug: async ({ siteId, slug }) => {
    set({ loading: true, error: null });
    try {
      const data = await api.get(`/api/pages/site/${siteId}/${slug}`);
      set({ current: data.page, loading: false });
      return data.page;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  /**
   * POST /api/pages (ADMIN only)
   * Šalje se:
   * {
   *   siteId: number,                 // obavezno
   *   title: string,                  // obavezno
   *   slug?: string,                  // opciono (ako ne pošalješ backend pravi iz title)
   *   templateId?: number | null,     // opciono
   *   status?: "draft"|"published",   // default "draft"
   *   content?: { version:number, blocks:Array } // default {version:1, blocks:[]}
   * }
   *
   * Primer:
   * createPage({
   *   siteId: 1,
   *   title: "Home",
   *   slug: "home",
   *   templateId: 3,
   *   status: "published",
   *   content: {
   *     version: 1,
   *     blocks: [
   *       { id: "b1", type: "hero", props: { title: "DOBRODOŠLI", subtitle: "..." } },
   *       { id: "b2", type: "text", props: { text: "Ovo je tekst..." } }
   *     ]
   *   }
   * })
   */
  createPage: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/api/pages', payload);
      set((s) => ({ pages: [data.page, ...s.pages], loading: false }));
      return data.page;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  updatePage: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const data = await api.put(`/api/pages/${id}`, payload);
      set((s) => ({
        pages: s.pages.map((x) => (x.id === id ? data.page : x)),
        current: s.current?.id === id ? data.page : s.current,
        loading: false,
      }));
      return data.page;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  deletePage: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.del(`/api/pages/${id}`);
      set((s) => ({
        pages: s.pages.filter((x) => x.id !== id),
        current: s.current?.id === id ? null : s.current,
        loading: false,
      }));
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },
}));
