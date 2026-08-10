import { StateCreator } from 'zustand';

export interface SettingsSlice {
  isDarkMode: boolean;
  toggleTheme: () => void;
  adminSelectedFarmerId: string | null;
  setAdminSelectedFarmerId: (id: string | null) => void;
  adminSelectedCustomerId: string | null;
  setAdminSelectedCustomerId: (id: string | null) => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  isDarkMode: true, // Default to dark mode as it's the premium theme
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  adminSelectedFarmerId: null,
  setAdminSelectedFarmerId: (id) => set({ adminSelectedFarmerId: id }),
  adminSelectedCustomerId: null,
  setAdminSelectedCustomerId: (id) => set({ adminSelectedCustomerId: id }),
});
