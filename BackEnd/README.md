# Hygrow Backend

This is the backend service for the Hygrow application, providing APIs for plant disease detection and growth prediction.

## Technologies Used
- Node.js
- Express
- `@gradio/client` (for AI model integration)
- `multer` (for handling file uploads)
- `cors` & `dotenv`

## Prerequisites
- Node.js installed
- A Hugging Face Space configured for disease detection (if using Gradio).

## Setup & Installation

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root of the `Backend` directory or update the existing one:
   ```env
   PORT=3000
   HF_SPACE=sam120904/hydro-disease-detector
   ```

4. Start the server:
   - For development (with watch mode):
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```

## API Endpoints

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

## Project Structure
- `controllers/` - Route logic and handlers.
- `routes/` - Express route definitions.
- `services/` - External API and AI model integrations (e.g., Gradio service).
- `utils/` - Helper functions like formatters and temporary file handlers.
