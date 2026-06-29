import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import diseaseRoutes from "./routes/disease.js";
import growthRoutes from "./routes/growthPrediction.js";

dotenv.config();

const app = express();

app.use(cors());

// Parse JSON FIRST
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({
  extended: true,
  limit: "50mb",
}));

// THEN register routes
app.use("/growth", growthRoutes);
app.use("/api", diseaseRoutes);

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "HyGrow Backend Running",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});