import { StateCreator } from 'zustand';

export interface SettingsSlice {
  isDarkMode: boolean;
  toggleTheme: () => void;
  adminSelectedFarmerId: string | null;
  setAdminSelectedFarmerId: (id: string | null) => void;
  adminSelectedCustomerId: string | null;
  setAdminSelectedCustomerId: (id: string | null) => void;
  farmerFeatures: {
    sensors: {
      enabled: boolean;
      temperature: boolean;
      humidity: boolean;
      ph: boolean;
      ec: boolean;
      waterLevel: boolean;
      lightIntensity: boolean;
    };
    aiTools: {
      enabled: boolean;
      diseaseDetection: boolean;
      yieldPrediction: boolean;
    };
    inventory: {
      enabled: boolean;
    };
    analytics: {
      enabled: boolean;
    };
  };
  toggleFarmerFeature: (category: keyof SettingsSlice['farmerFeatures']) => void;
  toggleFarmerSubFeature: (category: 'sensors' | 'aiTools', feature: string) => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  isDarkMode: true, // Default to dark mode as it's the premium theme
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  adminSelectedFarmerId: null,
  setAdminSelectedFarmerId: (id) => set({ adminSelectedFarmerId: id }),
  adminSelectedCustomerId: null,
  setAdminSelectedCustomerId: (id) => set({ adminSelectedCustomerId: id }),
  farmerFeatures: {
    sensors: {
      enabled: true,
      temperature: true,
      humidity: true,
      ph: true,
      ec: true,
      waterLevel: true,
      lightIntensity: true,
    },
    aiTools: {
      enabled: true,
      diseaseDetection: true,
      yieldPrediction: true,
    },
    inventory: {
      enabled: true,
    },
    analytics: {
      enabled: true,
    },
  },
  toggleFarmerFeature: (category) => set((state) => ({
    farmerFeatures: {
      ...state.farmerFeatures,
      [category]: {
        ...state.farmerFeatures[category],
        enabled: !state.farmerFeatures[category].enabled
      }
    }
  })),
  toggleFarmerSubFeature: (category, feature) => set((state) => ({
    farmerFeatures: {
      ...state.farmerFeatures,
      [category]: {
        ...state.farmerFeatures[category],
        [feature]: !state.farmerFeatures[category][feature]
      }
    }
  })),
});
