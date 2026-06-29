/**
 * Farm Help — Dummy Data
 * 
 * ⭐ IoT INTEGRATION POINT
 * This file mirrors the EXACT Firestore document structure that
 * your ESP32-S3 → FastAPI → Firestore pipeline will produce.
 * 
 * When ready to go live, simply swap imports in useSensorData.js
 * from this file to Firebase onSnapshot listeners.
 * 
 * Structure matches: POST /api/v1/telemetry/ingest body
 */

// ─── Current Telemetry (Latest ESP32 Reading) ─────────────────
export const currentTelemetry = {
  temperature: 24.4,       // °C — DHT22 sensor
  humidity: 68,            // %  — DHT22 sensor
  ph: 6.2,                 // pH sensor (analog)
  ec: 1.8,                 // mS — EC sensor
  waterLevel: 82,          // %  — Ultrasonic depth sensor
  pumpStatus: false,       // Relay state (false = OFF)
  autoMode: true,          // Auto-control enabled
  timestamp: new Date().toISOString(),
  deviceId: 'esp32-farm-01',
  firmwareVersion: '2.1.0',
  wifiRssi: -42,           // WiFi signal strength (dBm)
  uptime: 86400,           // Seconds since last boot
};

// ─── Historical Data (24h, every 30 min = 48 readings) ────────
function generateHistory() {
  const now = Date.now();
  const readings = [];
  
  for (let i = 47; i >= 0; i--) {
    const timestamp = new Date(now - i * 30 * 60 * 1000).toISOString();
    readings.push({
      timestamp,
      temperature: 22 + Math.sin(i / 6) * 3 + (Math.random() - 0.5),
      humidity: 65 + Math.cos(i / 8) * 10 + (Math.random() - 0.5) * 3,
      ph: 6.0 + Math.sin(i / 10) * 0.5 + (Math.random() - 0.5) * 0.2,
      ec: 1.7 + Math.cos(i / 12) * 0.4 + (Math.random() - 0.5) * 0.1,
      waterLevel: 75 + Math.sin(i / 5) * 15 + (Math.random() - 0.5) * 2,
    });
  }
  
  return readings;
}

export const historicalData = generateHistory();

// ─── 7-Day Historical Data (every 2 hours = 84 readings) ─────
function generateWeekHistory() {
  const now = Date.now();
  const readings = [];
  
  for (let i = 83; i >= 0; i--) {
    const timestamp = new Date(now - i * 2 * 60 * 60 * 1000).toISOString();
    readings.push({
      timestamp,
      temperature: 23 + Math.sin(i / 12) * 4 + (Math.random() - 0.5) * 2,
      humidity: 62 + Math.cos(i / 10) * 12 + (Math.random() - 0.5) * 5,
      ph: 6.1 + Math.sin(i / 15) * 0.6 + (Math.random() - 0.5) * 0.3,
      ec: 1.8 + Math.cos(i / 14) * 0.5 + (Math.random() - 0.5) * 0.2,
      waterLevel: 70 + Math.sin(i / 8) * 20 + (Math.random() - 0.5) * 5,
    });
  }
  
  return readings;
}

export const weeklyData = generateWeekHistory();

// ─── Alert History ────────────────────────────────────────────
export const alertHistory = [
  {
    id: 'alert-001',
    sensorKey: 'waterLevel',
    type: 'warning',
    message: 'Water level dropped below 25%',
    value: 18,
    threshold: 20,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolved: true,
    resolvedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-002',
    sensorKey: 'ph',
    type: 'warning',
    message: 'pH level above optimal range',
    value: 6.8,
    threshold: 6.5,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    resolved: true,
    resolvedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-003',
    sensorKey: 'temperature',
    type: 'critical',
    message: 'Temperature spike detected',
    value: 33.2,
    threshold: 28,
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    resolved: true,
    resolvedAt: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Marketplace Listings ─────────────────────────────────────
export const marketListings = [
  {
    id: 'listing-001',
    title: 'Fresh Hydroponic Lettuce',
    description: 'Crisp, pesticide-free butterhead lettuce grown in our NFT system. Harvested daily for maximum freshness.',
    price: 120,
    currency: '₹',
    unit: 'per kg',
    category: 'Vegetables',
    seller: { name: 'Green Valley Farm', rating: 4.8, location: 'Pune, MH' },
    image: null,
    stock: 50,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'listing-002',
    title: 'Hydroponic Basil Bundle',
    description: 'Aromatic sweet basil, perfect for Italian cuisine. Grown without soil in a controlled environment.',
    price: 80,
    currency: '₹',
    unit: 'per bundle',
    category: 'Herbs',
    seller: { name: 'Urban Greens', rating: 4.6, location: 'Mumbai, MH' },
    image: null,
    stock: 30,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'listing-003',
    title: 'Cherry Tomatoes (500g)',
    description: 'Sweet, vine-ripened cherry tomatoes from our greenhouse hydroponic setup.',
    price: 150,
    currency: '₹',
    unit: 'per pack',
    category: 'Vegetables',
    seller: { name: 'FarmFresh Co.', rating: 4.9, location: 'Bangalore, KA' },
    image: null,
    stock: 25,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'listing-004',
    title: 'Microgreens Mix',
    description: 'Nutrient-packed microgreens mix: sunflower, radish, and broccoli sprouts.',
    price: 200,
    currency: '₹',
    unit: 'per tray',
    category: 'Microgreens',
    seller: { name: 'SproutHouse', rating: 4.7, location: 'Delhi, DL' },
    image: null,
    stock: 15,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'listing-005',
    title: 'Strawberries (Premium)',
    description: 'Juicy, hydroponic strawberries grown in vertical towers. No pesticides.',
    price: 350,
    currency: '₹',
    unit: 'per kg',
    category: 'Fruits',
    seller: { name: 'Berry Bliss Farms', rating: 4.5, location: 'Nashik, MH' },
    image: null,
    stock: 10,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'listing-006',
    title: 'Nutrient Solution (A+B)',
    description: 'Complete 2-part hydroponic nutrient concentrate for leafy greens. Makes 500L.',
    price: 850,
    currency: '₹',
    unit: 'per set',
    category: 'Supplies',
    seller: { name: 'HydroSupply India', rating: 4.3, location: 'Chennai, TN' },
    image: null,
    stock: 100,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Disease Detection Dummy Results ──────────────────────────
export const diseaseResults = {
  detected: true,
  disease: 'Powdery Mildew',
  confidence: 0.87,
  description: 'White powdery spots on leaf surfaces. Common in high-humidity environments.',
  recommendations: [
    'Reduce humidity to below 60%',
    'Improve air circulation around plants',
    'Apply neem oil spray (organic treatment)',
    'Remove heavily affected leaves',
  ],
  severity: 'moderate',
};

// ─── Yield Prediction Dummy Results ───────────────────────────
export const yieldPrediction = {
  crop: 'Butterhead Lettuce',
  predictedYield: 4.2,
  unit: 'kg',
  timeToHarvest: 14,
  timeUnit: 'days',
  growthStage: 'Vegetative',
  healthScore: 88,
  factors: [
    { name: 'Temperature', status: 'optimal', impact: '+12%' },
    { name: 'pH Level', status: 'optimal', impact: '+8%' },
    { name: 'EC Level', status: 'good', impact: '+5%' },
    { name: 'Light', status: 'moderate', impact: '-3%' },
  ],
};

// ─── Device Info ──────────────────────────────────────────────
export const deviceInfo = {
  deviceId: 'esp32-farm-01',
  model: 'ESP32-S3-DevKitC-1',
  firmwareVersion: '2.1.0',
  lastBoot: new Date(Date.now() - 86400 * 1000).toISOString(),
  wifiSsid: 'FarmNetwork_5G',
  wifiRssi: -42,
  ipAddress: '192.168.1.105',
  sensors: ['DHT22', 'pH Analog', 'EC Analog', 'HC-SR04 Ultrasonic'],
  actuators: ['Water Pump Relay (GPIO 26)'],
};
