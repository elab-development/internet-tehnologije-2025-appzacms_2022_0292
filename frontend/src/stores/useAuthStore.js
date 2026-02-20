import { create } from 'zustand';
import { api } from '../lib/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  me: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get('/api/auth/me');
      set({ user: data.user, loading: false });
      return data.user;
    } catch (e) {
      set({ user: null, loading: false, error: e.message });
      return null;
    }
  },

  register: async ({ name, email, password }) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/api/auth/register', {
        name,
        email,
        password,
      });
      set({ user: data.user, loading: false });
      return data.user;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/api/auth/login', { email, password });
      set({ user: data.user, loading: false });
      return data.user;
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await api.post('/api/auth/logout', {});
      set({ user: null, loading: false });
    } catch (e) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },
}));
