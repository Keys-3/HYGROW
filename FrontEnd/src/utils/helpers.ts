/**
 * Farm Help — Helper Utilities
 */

import { colors } from '../theme/theme';
import { SENSOR_THRESHOLDS, SensorKey } from './constants';

export function getSensorStatus(sensorKey: SensorKey, value: number) {
  const threshold = SENSOR_THRESHOLDS[sensorKey];
  if (!threshold || value === null || value === undefined || Number.isNaN(value)) {
    return 'normal';
  }

  if (value <= threshold.criticalMin || value >= threshold.criticalMax) {
    return 'critical';
  }

  if (value < threshold.min || value > threshold.max) {
    return 'warning';
  }

  return 'normal';
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'critical':
      return colors.danger;
    case 'warning':
      return colors.warning;
    case 'normal':
      return colors.success;
    default:
      return colors.textMuted;
  }
}

export function formatSensorValue(
  sensorKey: SensorKey,
  value: number | null | undefined
) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--';
  }

  switch (sensorKey) {
    case 'temperature':
      return value.toFixed(1);

    case 'humidity':
      return value.toFixed(1);

    case 'ph':
      return value.toFixed(2);

    case 'ec':
      return value.toFixed(1);

    case 'waterLevel':
      return value.toFixed(1);

    case 'lightIntensity':
      return Math.round(value).toString();

    default:
      return value.toString();
  }
}

export function getStatusLabel(status: string) {
  switch (status) {
    case 'critical':
      return 'Critical';
    case 'warning':
      return 'Warning';
    case 'normal':
      return 'Normal';
    default:
      return 'Unknown';
  }
}

export function formatTime(timestamp: string | number | Date) {
  if (!timestamp) return '--';

  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(timestamp: string | number | Date) {
  if (!timestamp) return '--';

  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleDateString();
}

export function calcStats(values: number[]) {
  if (!values || values.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg =
    values.reduce((sum, value) => sum + value, 0) / values.length;

  return {
    min,
    max,
    avg,
  };
}

export function timeAgo(timestamp: string | number | Date) {
  if (!timestamp) return '--';

  const now = new Date();
  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    return '--';
  }

  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
}