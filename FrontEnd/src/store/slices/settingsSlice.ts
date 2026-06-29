import { StateCreator } from 'zustand';

export interface SettingsSlice {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  isDarkMode: true,
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
});
