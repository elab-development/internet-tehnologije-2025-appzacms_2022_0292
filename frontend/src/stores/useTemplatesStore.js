import { create } from 'zustand';
import { api } from '../lib/api';

export const useTemplatesStore = create((set) => ({
  templates: [],
  current: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get('/api/templates');
      set({ templates: data.templates, loading: false });
      return data.templates;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  fetchTemplate: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await api.get(`/api/templates/${id}`);
      set({ current: data.template, loading: false });
      return data.template;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  /**
   * POST /api/templates (ADMIN only)
   * Šalje se:
   * {
   *   name: string,                 // obavezno
   *   type?: "page"|"post"|"both",  // default "both"
   *   config?: object | null        // Tailwind-only config (npr. wrapper klase)
   * }
   *
   * Primer (Tailwind-only):
   * createTemplate({
   *   name: "Default Page",
   *   type: "page",
   *   config: {
   *     containerClass: "max-w-5xl mx-auto px-4",
   *     contentClass: "prose max-w-none",
   *     spacingClass: "space-y-6"
   *   }
   * })
   */
  createTemplate: async ({ name, type = 'both', config }) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/api/templates', { name, type, config });
      set((s) => ({
        templates: [data.template, ...s.templates],
        loading: false,
      }));
      return data.template;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  updateTemplate: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const data = await api.put(`/api/templates/${id}`, payload);
      set((s) => ({
        templates: s.templates.map((x) => (x.id === id ? data.template : x)),
        current: s.current?.id === id ? data.template : s.current,
        loading: false,
      }));
      return data.template;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  deleteTemplate: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.del(`/api/templates/${id}`);
      set((s) => ({
        templates: s.templates.filter((x) => x.id !== id),
        current: s.current?.id === id ? null : s.current,
        loading: false,
      }));
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },
}));
