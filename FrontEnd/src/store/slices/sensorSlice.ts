import { StateCreator } from 'zustand';

export interface SensorData {
  deviceId: string;
  temperature: number;
  humidity: number;
  ph: number;
  ec: number;
  waterLevel: number;
  lightIntensity: number;
  vpd: number;
  waterTemp: number;
  co2: number;
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
  sensorData: {
    deviceId: 'MOCK_ESP32_01',
    temperature: 24.5,
    humidity: 65.2,
    ph: 6.0,
    ec: 1.5,
    waterLevel: 82,
    lightIntensity: 15500,
    vpd: 0.95,
    waterTemp: 20,
    co2: 450,
    pumpStatus: true,
    autoMode: true,
    lastSensorTimestamp: new Date().toISOString(),
  },
  lastUpdated: new Date().toISOString(),
  isDeviceOnline: false,

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