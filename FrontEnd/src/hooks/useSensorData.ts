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

const SENSOR_COLLECTION = 'sensor_readings';

type HistoryPoint = {
  time: string;
  date?: string;
  temperature: number;
  humidity: number;
  ph: number;
  ec: number;
  waterLevel: number;
  lightIntensity: number;
  vpd: number;
  waterTemp: number;
  co2: number;
};

function calculateVPD(tempC: number, rh: number): number {
  if (tempC === 0 && rh === 0) return 0;
  // SVP = 0.61078 * exp((17.27 * T) / (T + 237.3)) in kPa
  const svp = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  const avp = svp * (rh / 100);
  return Number((svp - avp).toFixed(2));
}

export default function useSensorData() {
  const storeSensorData = useAppStore((state) => state.sensorData);
  const updateSensorData = useAppStore((state) => state.updateSensorData);
  const setDeviceOnline = useAppStore((state) => state.setDeviceOnline);

  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [weekly, setWeekly] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    // Firestore onSnapshot is already real-time,
    // so manual refresh isn't needed.
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Query for the latest single reading
    const qLatest = query(
      collection(db, SENSOR_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    
    // Query for the historical data (last 100 points)
    const qHistory = query(
      collection(db, SENSOR_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    let unsubLatest = () => {};
    let unsubHistory = () => {};

    try {
      unsubHistory = onSnapshot(qHistory, (snapshot) => {
        if (!snapshot.empty) {
          const fetchedHistory: HistoryPoint[] = snapshot.docs.map(doc => {
            const data = doc.data();
            const ts = data.timestamp?.toDate?.() || new Date();
            return {
              time: ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: ts.toLocaleDateString([], { month: 'short', day: 'numeric' }),
              temperature: data.air_temp_c ?? 0,
              humidity: data.humidity_percent ?? 0,
              ph: data.ph_value ?? 0,
              ec: data.tds_ppm ?? 0,
              waterLevel: data.water_level_percent ?? 0,
              lightIntensity: data.light_lux ?? 0,
              vpd: data.vpd !== undefined ? data.vpd : calculateVPD(data.air_temp_c ?? 0, data.humidity_percent ?? 0),
              waterTemp: data.water_temp_c ?? 20,
              co2: data.co2_ppm ?? 450,
            };
          }).reverse(); 
          
          setHistory(fetchedHistory.slice(-20)); 
          setWeekly(fetchedHistory); 
        } else {
          // Generate 20 points of mock history data using a sine wave so charts look beautiful
          const mockHistory: HistoryPoint[] = Array.from({ length: 20 }).map((_, i) => {
            const now = new Date();
            now.setMinutes(now.getMinutes() - (19 - i) * 5); // 5 min intervals
            const sinVal = Math.sin(i / 2);
            return {
              time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: now.toLocaleDateString([], { month: 'short', day: 'numeric' }),
              temperature: 24 + sinVal * 1.5,
              humidity: 65 + sinVal * 3,
              ph: 6.0 + sinVal * 0.2,
              ec: 1.5 + sinVal * 0.1,
              waterLevel: 82 + sinVal * 2,
              lightIntensity: 15500 + sinVal * 1000,
              vpd: 0.9 + sinVal * 0.1,
              waterTemp: 20 + sinVal * 0.5,
              co2: 450 + sinVal * 50,
            };
          });
          setHistory(mockHistory);
          setWeekly(mockHistory);
        }
      });

      unsubLatest = onSnapshot(
        qLatest,
      (snapshot) => {
        if (snapshot.empty) {
          console.warn('No sensor data found in Firestore - using local mock data');
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
          vpd: data.vpd !== undefined ? data.vpd : calculateVPD(data.air_temp_c ?? 0, data.humidity_percent ?? 0),
          waterTemp: data.water_temp_c ?? 20,
          co2: data.co2_ppm ?? 450,

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

        setLoading(false);
        setError(null);
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.warn('Firebase sync warning:', err);
        setError(err.message);
        setLoading(false);
        setDeviceOnline(false);
      }
    );
    } catch (err: any) {
        setError(err.message);
        setLoading(false);
    }

    return () => {
      unsubLatest();
      unsubHistory();
    };
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