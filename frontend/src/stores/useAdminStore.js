import { create } from 'zustand';
import { api } from '../lib/api';

export const useAdminStore = create((set, get) => ({
  overview: null,
  users: [],

  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchOverview: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get('/api/admin/overview');
      set({ overview: data, loading: false });
      return data;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  setUserRole: async (userId, role) => {
    set({ loading: true, error: null });
    try {
      const data = await api.put(`/api/admin/users/${userId}/role`, { role });

      set((s) => ({
        users: s.users.map((u) =>
          u.id === userId ? { ...u, role: data?.user?.role ?? role } : u,
        ),
        loading: false,
      }));

      return data.user;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  fetchUsers: async ({ q, role, sort } = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (role) params.set('role', role);
      if (sort) params.set('sort', sort);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const data = await api.get(`/api/admin/users${qs}`);

      set({ users: data.users || [], loading: false });
      return data.users || [];
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },
}));
