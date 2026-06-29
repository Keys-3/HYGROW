# HyGrow (Farm Help)

HyGrow is a cross-platform mobile and web application for **hydroponic farm management**. It connects farmers, customers, and administrators in a single ecosystem — from real-time IoT sensor monitoring and AI-powered crop insights to a local produce marketplace and order fulfillment.

This repository consists of:
- **Frontend**: Built with Expo (React Native) and Firebase, running on iOS, Android, and the web with a role-aware interface that adapts to each user type.
- **Backend**: A robust Node.js and Express.js service providing APIs for AI-powered plant disease detection and growth prediction.

---

## 🌟 Features

### For Farmers
| Feature | Description |
|---------|-------------|
| **Live Dashboard** | Real-time sensor readings (temperature, humidity, pH, TDS/EC, water level, light intensity) streamed from Firestore via ESP32 devices. |
| **Threshold Alerts** | Automatic warning and critical alerts when sensor values fall outside safe ranges. |
| **Analytics** | Historical charts for all sensors over 24-hour and 7-day windows. |
| **AI Disease Detection** | Upload or capture leaf photos for AI-powered disease identification and treatment recommendations. |
| **Yield / Growth Prediction** | Estimate harvest timing and growth status based on current sensor conditions. |
| **Inventory Management** | Add, edit, and track farm products; list items directly to the marketplace. |
| **Device Controls** | Monitor pump status and auto-mode; send actuator commands to ESP32 hardware via the IoT bridge. |

### For Customers
| Feature | Description |
|---------|-------------|
| **Marketplace** | Browse fresh hydroponic produce from local farms with search and category filters. |
| **Order Management** | Place orders, track status (pending → delivered), and view order history. |
| **Product Details** | View pricing, stock, seller info, and farm location for each listing. |

### For Administrators
| Feature | Description |
|---------|-------------|
| **Full Access** | All farmer and customer capabilities. |
| **Order Oversight** | View and manage all orders across the platform. |
| **Admin Panel** | Entry point for user and platform management (UI scaffolded in Settings). |

### Shared Features
- **Firebase Authentication** — Email/password sign-up and sign-in with persistent sessions.
- **Role-based Navigation** — Tab layout and routing adapt automatically to farmer, customer, or admin roles.
- **Push Notifications** — Local and web notifications for sensor threshold breaches.
- **Responsive Layout** — Bottom tabs on mobile; sidebar navigation on desktop (≥1024px).
- **Dark Theme** — Consistent dark UI across all screens.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Expo SDK 56, React Native 0.85, React 19, Expo Router |
| **State Management** | Zustand |
| **Backend** | Node.js, Express.js |
| **Database** | Firebase Auth, Cloud Firestore, Firebase Storage |
| **Cloud Functions** | Firebase Functions (disease detection via Hugging Face Gradio) |
| **Charts** | react-native-chart-kit |
| **Icons** | lucide-react-native |
| **AI / ML API** | Hugging Face Space (`sam120904/hydro-disease-detector`), `@gradio/client`, multer |
| **IoT** | ESP32 → Firestore telemetry; FastAPI actuator bridge |
| **Build / Deploy** | EAS Build, Docker (dev container), web(vercel and render), android expo development build, ios development build |

---

## 🏗 Architecture

```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   ESP32 Device  │────▶│  Cloud Firestore │◀────│   HyGrow App    │
│  (Sensors/IoT)  │     │ sensor_readings  │     │  (Expo/RN/Web)  │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                            │
                    ┌───────────────────────────────────────┤
                    │                                       │
            ┌───────▼────────┐                    ┌─────────▼────────┐
            │ Firebase Auth  │                    │ Node.js Backend  │
            │  + Firestore   │                    │ (Disease Detect) │
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

## 📁 Project Structure

```text
HyGrow/
├── Frontend/                   # Expo Router / React Native UI
│   ├── app/                    # Expo Router screens
│   │   ├── (auth)/             # Login & signup
│   │   ├── (tabs)/             # Main tab navigator
│   │   │   ├── dashboard/      # Sensor monitoring
│   │   │   ├── ai/             # Disease detection & yield prediction
│   │   │   ├── inventory/      # Farmer stock management
│   │   │   ├── market/         # Customer marketplace
│   │   │   ├── orders/         # Order history & details
│   │   │   ├── analytics.js    # Sensor history charts
│   │   │   └── settings.js     # Profile, permissions, logout
│   │   └── _layout.js          # Root layout
│   ├── src/
│   │   ├── components/         # Reusable UI (SensorCard, ChartWidget, Sidebar, etc.)
│   │   ├── hooks/              # useAuth, useSensorData, useInventory, useOrders, useAlerts
│   │   ├── services/           # API clients, IoT bridge, notifications, AI services
│   │   ├── store/              # Zustand slices (auth, sensors, alerts, settings)
│   │   ├── theme/              # Colors, typography, spacing
│   │   └── utils/              # Constants, helpers, config
│   ├── functions/              # Firebase Cloud Functions
│   │   └── index.js            # diseaseDetect — Hugging Face integration
│   ├── assets/                 # Icons, fonts, splash screen
│   ├── firebase.ts             # Firebase initialization
│   ├── firebase.json           # Firebase project config
│   ├── app.json                # Expo app config
│   ├── eas.json                # EAS Build profiles
│   └── dockerfile              # Dev container for Expo
│
└── Backend/                    # Node.js Express server
    ├── controllers/            # Route logic and handlers
    ├── routes/                 # Express route definitions
    ├── services/               # External API and AI model integrations (Gradio service)
    ├── utils/                  # Helper functions like formatters and temporary file handlers
    ├── uploads/                # Directory for handling multer file uploads
    └── server.js               # Express application entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** or **yarn**
- **Expo CLI** (`npx expo`)
- **Firebase project** with Auth and Firestore enabled
- A Hugging Face Space configured for disease detection (if using Gradio).
- (Optional) **EAS CLI** for native builds
- (Optional) **Docker** for containerized development

### 1️⃣ Backend Setup & Installation

1. Navigate to the backend directory:
   ```bash
   cd BackEnd
   npm install
   ```

2. Configure Environment Variables:
   Create a `.env` file in the root of the `BackEnd` directory:
   ```env
   PORT=3000
   HF_SPACE=sam120904/hydro-disease-detector
   ```

3. Start the server:
   ```bash
   npm run dev   # For development (with watch mode)
   npm start     # For production
   ```

### 2️⃣ Frontend Setup & Installation

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd FrontEnd
   npm install

   # Install Firebase Functions dependencies (if deploying functions)
   cd functions && npm install && cd ..
   ```

2. Configure Environment Variables:
   Create a `.env` file in the frontend root (see `.env.example`):
   ```env
   # Optional — IoT / backend API base URL
   EXPO_PUBLIC_API_BASE_URL=https://your-farm-api.onrender.com
   
   # Required for AI features (disease detection, growth prediction)
   EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
   ```
   *Note: Firebase configuration is initialized in `firebase.ts`.*

3. Start the app:
   ```bash
   npm start          # Start Expo dev server
   npm run ios        # iOS simulator / device
   npm run android    # Android emulator / device
   npm run web        # Web browser
   npm run build:web  # Export static web build
   ```

   Scan the QR code with **Expo Go** (for development) or use a **development build** (`expo-dev-client`) for full native module support.

### Docker (Development - Frontend)
```bash
cd FrontEnd
docker build -t hygrow .
docker run -p 8081:8081 -p 19000-19002:19000-19002 hygrow
```

---

## 📡 API Endpoints (Backend Node.js API)

### 1. Health Check
- **Endpoint**: `GET /`
- **Description**: Verifies if the backend server is running.
- **Response**:
  ```json
  {
    "success": true,
    "message": "HyGrow Backend Running"
  }
  ```

### 2. Disease Detection
- **Endpoint**: `POST /api/disease-detect`
- **Description**: Accepts a base64 encoded image of a plant leaf and returns the detected disease or plant health status.
- **Body**:
  ```json
  {
    "imageBase64": "data:image/jpeg;base64,...",
    "fileName": "leaf.jpg"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "result": { ... }
  }
  ```

### 3. Growth Prediction
- **Endpoint**: `POST /growth`
- **Description**: Predicts the harvest time, growth status, and provides recommendations based on environmental factors.
- **Body**:
  ```json
  {
    "temperature": 25,
    "humidity": 60,
    "tds": 800,
    "ph": 6.0
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "prediction": {
      "harvestTime": "...",
      "growthStatus": "...",
      "recommendations": ["..."]
    }
  }
  ```

---

## 👥 User Roles

| Role | Default Route | Tabs |
|------|---------------|------|
| **Farmer** | Dashboard | Home, AI Tools, Stock, Stats, Settings |
| **Customer** | Marketplace | Market, Orders, Settings |
| **Admin** | Dashboard | All tabs (desktop sidebar shows full navigation) |

Sign up at `/signup` and select a role. Farmer accounts can optionally provide farm name and location.

---

## ☁️ Firebase Cloud Functions

Deploy the disease detection cloud function (if bypassing the Node.js backend):

```bash
cd FrontEnd
firebase deploy --only functions
```

The `diseaseDetect` function accepts multipart image uploads, forwards them to the Hugging Face Gradio space, and returns normalized disease results (name, confidence, severity, recommendations).

---

## 🔌 IoT Integration

HyGrow expects ESP32 devices to write telemetry to the `sensor_readings` Firestore collection. The app subscribes to the latest reading in real time via `onSnapshot`.

Actuator commands (e.g., pump on/off) are sent through a FastAPI backend defined in `src/services/iotBridge.ts`:

```http
POST /api/v1/actuator/command
GET  /api/v1/device/{deviceId}/status
```

Configure `EXPO_PUBLIC_API_BASE_URL` to point to your IoT gateway.

---

## 📊 Sensor Thresholds

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

## 📦 Building for Production

Using [EAS Build](https://docs.expo.dev/build/introduction/) for the frontend app:

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

## 📜 Scripts Reference (Frontend)

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run on iOS |
| `npm run android` | Run on Android |
| `npm run web` | Run in web browser |
| `npm run build:web` | Export static web bundle |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
