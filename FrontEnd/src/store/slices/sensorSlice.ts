import { StateCreator } from 'zustand';

export interface SensorData {
  deviceId: string;
  temperature: number;
  humidity: number;
  ph: number;
  ec: number;
  waterLevel: number;
  lightIntensity: number;
  pumpStatus: boolean;
  autoMode: boolean;
  lastSensorTimestamp: string;
}

export interface SensorSlice {
  sensorData: SensorData | null;
  lastUpdated: string;
  isDeviceOnline: boolean;
  updateSensorData: (data: SensorData) => void;
  setDeviceOnline: (online: boolean) => void;
  togglePump: () => void;
  toggleAutoMode: () => void;
}

export const createSensorSlice: StateCreator<SensorSlice> = (set) => ({
  sensorData: null,
  lastUpdated: new Date().toISOString(),
  isDeviceOnline: true,

  updateSensorData: (data) =>
    set({
      sensorData: data,
      lastUpdated: new Date().toISOString(),
    }),

  setDeviceOnline: (online) =>
    set({
      isDeviceOnline: online,
    }),

  togglePump: () =>
    set((state) => ({
      sensorData: state.sensorData
        ? {
            ...state.sensorData,
            pumpStatus: !state.sensorData.pumpStatus,
          }
        : null,
    })),

  toggleAutoMode: () =>
    set((state) => ({
      sensorData: state.sensorData
        ? {
            ...state.sensorData,
            autoMode: !state.sensorData.autoMode,
          }
        : null,
    })),
});