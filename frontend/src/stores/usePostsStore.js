import { create } from 'zustand';
import { api } from '../lib/api';

export const usePostsStore = create((set) => ({
  posts: [],
  current: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchPosts: async ({ siteId, authorId, status } = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (siteId) params.set('siteId', siteId);
      if (authorId) params.set('authorId', authorId);
      if (status) params.set('status', status);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const data = await api.get(`/api/posts${qs}`);
      set({ posts: data.posts, loading: false });
      return data.posts;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  fetchPost: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await api.get(`/api/posts/${id}`);
      set({ current: data.post, loading: false });
      return data.post;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  fetchPostBySlug: async ({ siteId, slug }) => {
    set({ loading: true, error: null });
    try {
      const data = await api.get(`/api/posts/site/${siteId}/${slug}`);
      set({ current: data.post, loading: false });
      return data.post;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  /**
   * POST /api/posts (ulogovan USER ili ADMIN)
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
   * createPost({
   *   siteId: 1,
   *   title: "Moj prvi post",
   *   status: "draft",
   *   templateId: 2,
   *   content: {
   *     version: 1,
   *     blocks: [
   *       { id: "t1", type: "text", props: { text: "Zdravo!" } },
   *       { id: "img1", type: "image", props: { url: "https://...", alt: "cover" } }
   *     ]
   *   }
   * })
   */
  createPost: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/api/posts', payload);
      set((s) => ({ posts: [data.post, ...s.posts], loading: false }));
      return data.post;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  updatePost: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const data = await api.put(`/api/posts/${id}`, payload);
      set((s) => ({
        posts: s.posts.map((x) => (x.id === id ? data.post : x)),
        current: s.current?.id === id ? data.post : s.current,
        loading: false,
      }));
      return data.post;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  deletePost: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.del(`/api/posts/${id}`);
      set((s) => ({
        posts: s.posts.filter((x) => x.id !== id),
        current: s.current?.id === id ? null : s.current,
        loading: false,
      }));
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },
}));
