# HyGrow

HyGrow is a cross-platform mobile and web application for **hydroponic farm management**. It connects farmers, customers, and administrators in a single ecosystem — from real-time IoT sensor monitoring and AI-powered crop insights to a local produce marketplace and order fulfillment.

Built with **Expo (React Native)** and **Firebase**, HyGrow runs on iOS, Android, and the web with a role-aware interface that adapts to each user type.

---

## Features

### For Farmers

| Feature | Description |
|---------|-------------|
| **Live Dashboard** | Real-time sensor readings (temperature, humidity, pH, TDS/EC, water level, light intensity) streamed from Firestore via ESP32 devices |
| **Threshold Alerts** | Automatic warning and critical alerts when sensor values fall outside safe ranges |
| **Analytics** | Historical charts for all sensors over 24-hour and 7-day windows |
| **AI Disease Detection** | Upload or capture leaf photos for AI-powered disease identification and treatment recommendations |
| **Yield / Growth Prediction** | Estimate harvest timing and growth status based on current sensor conditions |
| **Inventory Management** | Add, edit, and track farm products; list items directly to the marketplace |
| **Device Controls** | Monitor pump status and auto-mode; send actuator commands to ESP32 hardware via the IoT bridge |

### For Customers

| Feature | Description |
|---------|-------------|
| **Marketplace** | Browse fresh hydroponic produce from local farms with search and category filters |
| **Order Management** | Place orders, track status (pending → delivered), and view order history |
| **Product Details** | View pricing, stock, seller info, and farm location for each listing |

### For Administrators

| Feature | Description |
|---------|-------------|
| **Full Access** | All farmer and customer capabilities |
| **Order Oversight** | View and manage all orders across the platform |
| **Admin Panel** | Entry point for user and platform management (UI scaffolded in Settings) |

### Shared

- **Firebase Authentication** — Email/password sign-up and sign-in with persistent sessions
- **Role-based Navigation** — Tab layout and routing adapt automatically to farmer, customer, or admin roles
- **Push Notifications** — Local and web notifications for sensor threshold breaches
- **Responsive Layout** — Bottom tabs on mobile; sidebar navigation on desktop (≥1024px)
- **Dark Theme** — Consistent dark UI across all screens

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Expo SDK 56, React Native 0.85, React 19, Expo Router |
| **State Management** | Zustand |
| **Backend** | Node.js, Express.js |
| **Database** | Firebase Auth, Cloud Firestore, Firebase Storage |
| **Cloud Functions** | Firebase Functions (disease detection via Hugging Face Gradio) |
| **Charts** | react-native-chart-kit |
| **Icons** | lucide-react-native |
| **AI / ML** | Hugging Face Space (`sam120904/hydro-disease-detector`), external growth prediction API |
| **IoT** | ESP32 → Firestore telemetry; FastAPI actuator bridge |
| **Build / Deploy** | EAS Build, Docker (dev container), web(vercel and render), android expo development build, ios development build |

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   ESP32 Device  │────▶│  Cloud Firestore │◀────│   HyGrow App    │
│  (Sensors/IoT)  │     │ sensor_readings  │     │  (Expo/RN/Web)  │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                            │
                    ┌───────────────────────────────────────┤
                    │                                       │
            ┌───────▼────────┐                    ┌─────────▼────────┐
            │ Firebase Auth  │                    │ Firebase Functions│
            │  + Firestore   │                    │ (Disease Detect)  │
            └────────────────┘                    └─────────┬────────┘
                                                            │
                                                    ┌───────▼────────┐
                                                    │ Hugging Face   │
                                                    │  Gradio Space  │
                                                    └────────────────┘
```

### Firestore Collections

| Collection | Purpose |
|------------|---------|
| `users` | User profiles with role, contact info, and farm details |
| `sensor_readings` | ESP32 telemetry (air temp, humidity, pH, TDS, water level, light) |
| `inventory` | Farmer product inventory |
| `market_listings` | Active marketplace listings linked to inventory |
| `orders` | Customer order records |
| `order_items` | Line items per order |
| `order_tracking` | Order status history and notes |

### Sensor Data Schema (Firestore)

```json
{
  "device_id": "esp32-farm-001",
  "air_temp_c": 24.5,
  "humidity_percent": 65,
  "ph_value": 6.2,
  "tds_ppm": 280,
  "water_level_percent": 75,
  "light_lux": 1200,
  "timestamp": "<Firestore Timestamp>"
}
```

---

## Project Structure

```
HyGrow/
├── app/                        # Expo Router screens
│   ├── (auth)/                 # Login & signup
│   ├── (tabs)/                 # Main tab navigator
│   │   ├── dashboard/          # Sensor monitoring
│   │   ├── ai/                 # Disease detection & yield prediction
│   │   ├── inventory/          # Farmer stock management
│   │   ├── market/             # Customer marketplace
│   │   ├── orders/             # Order history & details
│   │   ├── analytics.js        # Sensor history charts
│   │   └── settings.js         # Profile, permissions, logout
│   └── _layout.js              # Root layout
├── src/
│   ├── components/             # Reusable UI (SensorCard, ChartWidget, Sidebar, etc.)
│   ├── hooks/                  # useAuth, useSensorData, useInventory, useOrders, useAlerts
│   ├── services/               # API clients, IoT bridge, notifications, AI services
│   ├── store/                  # Zustand slices (auth, sensors, alerts, settings)
│   ├── theme/                  # Colors, typography, spacing
│   └── utils/                  # Constants, helpers, config
├── functions/                  # Firebase Cloud Functions
│   └── index.js                # diseaseDetect — Hugging Face integration
├── assets/                     # Icons, fonts, splash screen
├── firebase.ts                 # Firebase initialization
├── firebase.json               # Firebase project config
├── app.json                    # Expo app config
├── eas.json                    # EAS Build profiles
└── dockerfile                  # Dev container for Expo
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** or **yarn**
- **Expo CLI** (`npx expo`)
- **Firebase project** with Auth and Firestore enabled
- (Optional) **EAS CLI** for native builds
- (Optional) **Docker** for containerized development

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd HyGrow

# Install dependencies
npm install

# Install Firebase Functions dependencies (if deploying functions)
cd functions && npm install && cd ..
```

### Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
# Optional — IoT / backend API base URL
EXPO_PUBLIC_API_BASE_URL=https://your-farm-api.onrender.com

# Required for AI features (disease detection, growth prediction)
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

Firebase configuration is initialized in `firebase.ts`. For production, consider moving credentials to environment variables rather than hardcoding them.

### Running the App

```bash
# Start the Expo dev server
npm start

# Run on specific platforms
npm run ios        # iOS simulator / device
npm run android    # Android emulator / device
npm run web        # Web browser

# Export static web build
npm run build:web
```

Scan the QR code with **Expo Go** (for development) or use a **development build** (`expo-dev-client`) for full native module support.

### Docker (Development)

```bash
docker build -t hygrow .
docker run -p 8081:8081 -p 19000-19002:19000-19002 hygrow
```

The container runs `expo start --tunnel` on ports 8081 and 19000–19002.

---

## User Roles

| Role | Default Route | Tabs |
|------|---------------|------|
| **Farmer** | Dashboard | Home, AI Tools, Stock, Stats, Settings |
| **Customer** | Marketplace | Market, Orders, Settings |
| **Admin** | Dashboard | All tabs (desktop sidebar shows full navigation) |

Sign up at `/signup` and select a role. Farmer accounts can optionally provide farm name and location.

---

## Firebase Cloud Functions

Deploy the disease detection function:

```bash
# From project root
firebase deploy --only functions
```

The `diseaseDetect` function accepts multipart image uploads, forwards them to the Hugging Face Gradio space, and returns normalized disease results (name, confidence, severity, recommendations).

---

## IoT Integration

HyGrow expects ESP32 devices to write telemetry to the `sensor_readings` Firestore collection. The app subscribes to the latest reading in real time via `onSnapshot`.

Actuator commands (e.g., pump on/off) are sent through a FastAPI backend defined in `src/services/iotBridge.ts`:

```
POST /api/v1/actuator/command
GET  /api/v1/device/{deviceId}/status
```

Configure `EXPO_PUBLIC_API_BASE_URL` to point to your IoT gateway.

---

## Sensor Thresholds

Default safe ranges (configurable in `src/utils/constants.ts`):

| Sensor | Normal Range | Unit |
|--------|-------------|------|
| Temperature | 18 – 28 | °C |
| Humidity | 50 – 80 | % |
| pH | 5.5 – 6.5 | — |
| TDS / EC | 150 – 500 | ppm |
| Water Level | 20 – 100 | % |
| Light Intensity | 500 – 5000 | lux |

Values outside normal ranges trigger **warning** alerts; values beyond critical bounds trigger **critical** alerts.

---

## Building for Production

Using [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure (first time)
eas build:configure

# Build
eas build --platform ios --profile production
eas build --platform android --profile production
```

Build profiles are defined in `eas.json` (`development`, `preview`, `production`).

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run on iOS |
| `npm run android` | Run on Android |
| `npm run web` | Run in web browser |
| `npm run build:web` | Export static web bundle |

---

## License

This project is licensed under the [MIT License](LICENSE).
