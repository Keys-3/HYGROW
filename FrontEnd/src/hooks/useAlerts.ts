/**
 * Farm Help — useAlerts Hook
 */

import { useEffect, useMemo } from 'react';
import { SENSOR_THRESHOLDS, SENSOR_KEYS, SENSOR_CONFIG, SensorKey } from '../utils/constants';
import { getSensorStatus, formatSensorValue } from '../utils/helpers';
import useAppStore from '../store/useAppStore';

export default function useAlerts(sensorData: any) {
  const activeAlerts = useAppStore((state) => state.activeAlerts);
  const addAlert = useAppStore((state) => state.addAlert);

  const currentAlerts = useMemo(() => {
    if (!sensorData) return [];

    const alerts: any[] = [];

    SENSOR_KEYS.forEach((key: SensorKey) => {
      const value = sensorData[key];
      if (value === undefined || value === null) return;

      const status = getSensorStatus(key, value);
      const threshold = SENSOR_THRESHOLDS[key];

      if (status !== 'normal') {
        const isHigh = value > threshold.max;
        const config = SENSOR_CONFIG[key];
        const label = config?.label || key;
        const formattedVal = `${formatSensorValue(key, value)}${threshold.unit}`;
        const limitVal = `${formatSensorValue(key, isHigh ? threshold.max : threshold.min)}${threshold.unit}`;

        alerts.push({
          id: `alert-${key}-${status}`,
          sensorKey: key,
          sensorLabel: label,
          type: status,
          value: value,
          threshold: isHigh ? threshold.max : threshold.min,
          unit: threshold.unit,
          message: `${label} is ${isHigh ? 'above' : 'below'} threshold: ${formattedVal} (Limit: ${limitVal})`,
          timestamp: new Date().toISOString(),
        });
      }
    });

    return alerts;
  }, [sensorData]);

  useEffect(() => {
    if (currentAlerts.length > 0) {
      currentAlerts.forEach((alert) => {
        const exists = activeAlerts.some(
          (a: any) => a.sensorKey === alert.sensorKey && a.type === alert.type
        );
        if (!exists) {
          addAlert(alert);
        }
      });
    }
  }, [currentAlerts, activeAlerts, addAlert]);

  return {
    currentAlerts,
    activeAlerts,
    hasAlerts: currentAlerts.length > 0,
  };
}
