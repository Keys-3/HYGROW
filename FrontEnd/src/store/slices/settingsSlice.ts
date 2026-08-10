import { StateCreator } from 'zustand';

export interface SettingsSlice {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  isDarkMode: true, // Default to dark mode as it's the premium theme
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
});
