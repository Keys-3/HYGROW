const functions = require("firebase-functions");
const { Client } = require("@gradio/client");
const Busboy = require("busboy");

const HF_SPACE_ID = "sam120904/hydro-disease-detector";

/**
 * Convert the raw Hugging Face result into a format
 * your Hygrow disease screen can render.
 */
function normalizeDiseaseResult(rawData) {
  // If HF returns array-like data
  if (Array.isArray(rawData)) {
    const first = rawData[0];

    // If the first item is an object with labels/scores
    if (first && typeof first === "object") {
      const disease =
        first.label ||
        first.class ||
        first.disease ||
        first.prediction ||
        "Unknown disease";

      const confidence =
        typeof first.confidence === "number"
          ? first.confidence
          : typeof first.score === "number"
          ? first.score
          : 0;

      return {
        disease,
        confidence,
        severity: confidence >= 0.8 ? "moderate" : "low",
        description: `Detected disease: ${disease}`,
        recommendations: [
          "Inspect affected leaves closely.",
          "Remove infected or heavily damaged leaves if necessary.",
          "Monitor humidity, nutrients, pH, and airflow before applying treatment.",
        ],
        raw: rawData,
      };
    }

    // If first item is just a string
    if (typeof first === "string") {
      return {
        disease: first,
        confidence: 0,
        severity: "moderate",
        description: `Detected disease: ${first}`,
        recommendations: [
          "Inspect the plant carefully for spread.",
          "Compare symptoms with known disease signs.",
          "Apply treatment only after confirming the diagnosis.",
        ],
        raw: rawData,
      };
    }
  }

  // If HF returns object directly
  if (rawData && typeof rawData === "object") {
    const disease =
      rawData.label ||
      rawData.class ||
      rawData.disease ||
      rawData.prediction ||
      "Unknown disease";

    const confidence =
      typeof rawData.confidence === "number"
        ? rawData.confidence
        : typeof rawData.score === "number"
        ? rawData.score
        : 0;

    return {
      disease,
      confidence,
      severity: confidence >= 0.8 ? "moderate" : "low",
      description: `Detected disease: ${disease}`,
      recommendations: [
        "Inspect affected leaves closely.",
        "Remove infected foliage if needed.",
        "Adjust environmental conditions before treatment.",
      ],
      raw: rawData,
    };
  }

  // Fallback
  return {
    disease: "Unknown disease",
    confidence: 0,
    severity: "moderate",
    description: "The model returned an unexpected result format.",
    recommendations: [
      "Try another clearer image with good lighting.",
      "Ensure the leaf is centered and in focus.",
    ],
    raw: rawData,
  };
}

/**
 * HTTPS Firebase Function
 * Receives multipart/form-data with an "image" field from Expo.
 */
exports.diseaseDetect = functions.https.onRequest(async (req, res) => {
  // Basic CORS headers for Expo/web requests
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Use POST.",
    });
  }

  try {
    const contentType = req.headers["content-type"] || "";

    if (!contentType.includes("multipart/form-data")) {
      return res.status(400).json({
        success: false,
        message: "Request must be multipart/form-data with an image field.",
      });
    }

    const imageBuffer = await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      let uploadedBuffer = null;

      busboy.on("file", (fieldname, file) => {
        if (fieldname !== "image") {
          file.resume();
          return;
        }

        const chunks = [];

        file.on("data", (data) => {
          chunks.push(data);
        });

        file.on("end", () => {
          uploadedBuffer = Buffer.concat(chunks);
        });
      });

      busboy.on("finish", () => {
        if (!uploadedBuffer) {
          reject(new Error("No image file found in 'image' field."));
        } else {
          resolve(uploadedBuffer);
        }
      });

      busboy.on("error", reject);

      busboy.end(req.rawBody);
    });

    // Convert uploaded buffer to Blob for @gradio/client
    const imageBlob = new Blob([imageBuffer]);

    // Connect to HF Space
    const client = await Client.connect(HF_SPACE_ID);

    // This matches the API snippet you shared:
    // client.predict("/predict", { image: exampleImage })
    const result = await client.predict("/predict", {
      image: imageBlob,
    });

    const rawData = result?.data ?? result;
    const normalized = normalizeDiseaseResult(rawData);

    return res.status(200).json({
      success: true,
      result: normalized,
    });
  } catch (error) {
    console.error("Disease detection function error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Disease detection failed",
    });
  }
});