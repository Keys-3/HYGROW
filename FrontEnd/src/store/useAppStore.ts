import { create } from 'zustand';
import { createAuthSlice, AuthSlice } from './slices/authSlice';
import { createSettingsSlice, SettingsSlice } from './slices/settingsSlice';
import { createSensorSlice, SensorSlice } from './slices/sensorSlice';
import { createAlertsSlice, AlertsSlice } from './slices/alertsSlice';

// Combine slices into a single store type
type StoreState = AuthSlice & SettingsSlice & SensorSlice & AlertsSlice;

const useAppStore = create<StoreState>((...a) => ({
  ...createAuthSlice(...a),
  ...createSettingsSlice(...a),
  ...createSensorSlice(...a),
  ...createAlertsSlice(...a),
}));

export default useAppStore;
