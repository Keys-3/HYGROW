import express from "express";
import { growthPrediction } from "../controllers/growthController.js";
const router = express.Router();

router.post("/", growthPrediction);

export default router;