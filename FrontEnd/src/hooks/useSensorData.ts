/**
 * Farm Help — useSensorData Hook (Firestore Real-Time)
 */

import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../../firebase'; // adjust path if needed
import { SensorData } from '../store/slices/sensorSlice';
import useAppStore from '../store/useAppStore';
import { historicalData, weeklyData as dummyWeeklyData } from '../data/dummyData';

const SENSOR_COLLECTION = 'sensor_readings';

type HistoryPoint = {
  time: string;
  temperature: number;
  humidity: number;
  ph: number;
  ec: number;
  waterLevel: number;
  lightIntensity: number;
};

// Map dummy data to the correct format expected by analytics.js
const mappedHistoricalData = historicalData.map((d: any) => ({
  ...d,
  time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  lightIntensity: d.lightIntensity || 0,
}));

const mappedWeeklyData = dummyWeeklyData.map((d: any) => ({
  ...d,
  date: new Date(d.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
  time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  lightIntensity: d.lightIntensity || 0,
}));

export default function useSensorData() {
  const storeSensorData = useAppStore((state) => state.sensorData);
  const updateSensorData = useAppStore((state) => state.updateSensorData);
  const setDeviceOnline = useAppStore((state) => state.setDeviceOnline);

  const [history, setHistory] = useState<HistoryPoint[]>(mappedHistoricalData);
  const [weekly, setWeekly] = useState<any[]>(mappedWeeklyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    // Firestore onSnapshot is already real-time,
    // so manual refresh isn't needed.
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = query(
      collection(db, SENSOR_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setError('No sensor data found');
          setLoading(false);
          setDeviceOnline(false);
          return;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        const sensorTimestamp =
          data.timestamp?.toDate?.()?.toISOString?.() ?? new Date().toISOString();

        const mapped: SensorData = {
          deviceId: data.device_id ?? 'Unknown Device',
          temperature: data.air_temp_c ?? 0,
          humidity: data.humidity_percent ?? 0,
          ph: data.ph_value ?? 0,

          // Temporary mapping: using TDS as EC until you add a real EC field
          ec: data.tds_ppm ?? 0,

          waterLevel: data.water_level_percent ?? 0,
          lightIntensity: data.light_lux ?? 0,

          // These aren't in Firestore yet, so using defaults
          pumpStatus: false,
          autoMode: true,

          lastSensorTimestamp: sensorTimestamp,
        };

        updateSensorData(mapped);

        // Device online/offline check
        // If no reading arrives for > 2 minutes, mark offline
        const now = Date.now();
        const lastSeen = new Date(sensorTimestamp).getTime();
        const diffMs = now - lastSeen;
        setDeviceOnline(diffMs <= 2 * 60 * 1000);

        // Append history point for local charts
        setHistory((prev) => {
          const next: HistoryPoint[] = [
            {
              time: new Date(sensorTimestamp).toLocaleTimeString(),
              temperature: mapped.temperature,
              humidity: mapped.humidity,
              ph: mapped.ph,
              ec: mapped.ec,
              waterLevel: mapped.waterLevel,
              lightIntensity: mapped.lightIntensity,
            },
            ...prev,
          ];

          return next.slice(0, 20); // keep last 20 points
        });

        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching sensor data:', err);
        setError(err.message);
        setLoading(false);
        setDeviceOnline(false);
      }
    );

    return () => unsubscribe();
  }, [updateSensorData, setDeviceOnline]);

  return {
    current: storeSensorData,
    history,
    weekly,
    loading,
    error,
    refresh,
  };
}