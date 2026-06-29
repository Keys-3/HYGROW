import { predictGrowth } from "../services/growthPrediction.js";

export async function growthPrediction(req, res) {
  try {
    const { temperature, humidity, tds, ph } = req.body;
    const prediction = await predictGrowth({
    temperature,
    humidity,
    tds,
    ph
});

res.json({
    success: true,
    prediction: {
        harvestTime: prediction[0],
        growthStatus: prediction[1],
        recommendations: prediction[2]
            .split("\n")
            .filter(Boolean),
    }
});

    console.log("Prediction:", prediction);

    res.json({
      success: true,
      prediction,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}