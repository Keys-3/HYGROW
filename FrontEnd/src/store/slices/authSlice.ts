import { StateCreator } from 'zustand';

export type UserRole = 'farmer' | 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  farm_name?: string;
  farm_location?: string;
  created_at?: string;
}

export interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  login: (user: User) =>
    set({
      user,
      isAuthenticated: true,
      loading: false,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      loading: false,
    }),

  setUser: (user: User | null) =>
    set({
      user,
      isAuthenticated: !!user,
      loading: false,
    }),

  updateUser: (updates: Partial<User>) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            ...updates,
          }
        : null,
    })),

  setLoading: (loading: boolean) =>
    set({
      loading,
    }),
});