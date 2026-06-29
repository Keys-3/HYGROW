/**
 * Farm Help — Constants
 */

export interface Threshold {
  min: number;
  max: number;
  unit: string;
  criticalMin: number;
  criticalMax: number;
}

export type SensorKey =
  | 'temperature'
  | 'humidity'
  | 'ph'
  | 'ec'
  | 'waterLevel'
  | 'lightIntensity';

export const SENSOR_THRESHOLDS: Record<SensorKey, Threshold> = {
  temperature: {
    min: 18,
    max: 28,
    unit: '°C',
    criticalMin: 10,
    criticalMax: 35,
  },
  humidity: {
    min: 50,
    max: 80,
    unit: '%',
    criticalMin: 30,
    criticalMax: 95,
  },
  ph: {
    min: 5.5,
    max: 6.5,
    unit: '',
    criticalMin: 4.0,
    criticalMax: 8.0,
  },
  ec: {
    /**
     * NOTE:
     * Right now your Firestore hook maps `tds_ppm` -> `ec`.
     * So these thresholds are placeholders until you store real EC values.
     *
     * If you continue using TDS as "ec", update these to realistic TDS ranges.
     */
    min: 150,
    max: 500,
    unit: 'ppm',
    criticalMin: 50,
    criticalMax: 1000,
  },
  waterLevel: {
    min: 20,
    max: 100,
    unit: '%',
    criticalMin: 10,
    criticalMax: 100,
  },
  lightIntensity: {
    min: 500,
    max: 5000,
    unit: 'lux',
    criticalMin: 100,
    criticalMax: 10000,
  },
};

export const SENSOR_CONFIG: Record<
  SensorKey,
  {
    label: string;
    unit: string;
    color: string;
    icon: string;
    description?: string;
  }
> = {
  temperature: {
    label: 'Temperature',
    unit: '°C',
    color: '#EF4444',
    icon: '🌡️',
    description: 'Ambient air temperature around the crop environment.',
  },
  humidity: {
    label: 'Humidity',
    unit: '%',
    color: '#3B82F6',
    icon: '💧',
    description: 'Relative humidity of the surrounding air.',
  },
  ph: {
    label: 'pH',
    unit: '',
    color: '#10B981',
    icon: '🧪',
    description: 'Acidity / alkalinity of the nutrient solution or water.',
  },
  ec: {
    /**
     * Since your hook currently maps tds_ppm -> ec,
     * label it clearly so the UI matches the real source.
     */
    label: 'TDS / EC',
    unit: 'ppm',
    color: '#F59E0B',
    icon: '⚡',
    description: 'Currently sourced from TDS readings in Firestore.',
  },
  waterLevel: {
    label: 'Water Level',
    unit: '%',
    color: '#06B6D4',
    icon: '🪣',
    description: 'Tank or reservoir fill level percentage.',
  },
  lightIntensity: {
    label: 'Light Intensity',
    unit: 'lux',
    color: '#FACC15',
    icon: '☀️',
    description: 'Current light exposure measured in lux.',
  },
};

export const SENSOR_KEYS: SensorKey[] = [
  'temperature',
  'humidity',
  'ph',
  'ec',
  'waterLevel',
  'lightIntensity',
];

export const AUTO_CONTROL_RULES = {
  pump: {
    onCondition: 'Water level below 30%',
    offCondition: 'Water level above 80%',
    minWaterLevel: 30,
    maxWaterLevel: 80,
  },
};

export const DEVICE_CONFIG = {
  postIntervalMs: 30000,
  apiEndpoint: '/api/v1/telemetry/ingest',
  deviceIdPrefix: 'esp32-farm-',
};

export const ACTUATOR_STATES = {
  PUMP_ON: 'PUMP_ON',
  PUMP_OFF: 'PUMP_OFF',
} as const;

export const APP_CONSTANTS = {
  HISTORY_LIMIT: 100,
  REFRESH_INTERVAL: 30000,
  MAX_ALERTS: 20,
};

export const ALERT_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
} as const;

export const DEFAULT_SENSOR_DATA = {
  deviceId: 'esp32-farm-001',
  temperature: 24,
  humidity: 65,
  ph: 6.2,

  /**
   * Since your hook maps tds_ppm -> ec,
   * default value should follow the same meaning.
   */
  ec: 280,

  waterLevel: 75,
  lightIntensity: 1200,

  pumpStatus: false,
  autoMode: true,
  lastSensorTimestamp: new Date().toISOString(),
};