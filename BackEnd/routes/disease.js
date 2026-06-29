import express from 'express';

import {
  saveTempImage,
  deleteTempImage,
} from '../utils/tempFile.js';

import {
  detectDisease,
} from '../services/gradioService.js';

import {
  normalizeResult,
} from '../utils/formatter.js';

const router = express.Router();

router.post('/disease-detect', async (req, res) => {
  let tempPath = null;

  try {
    const {
      imageBase64,
      fileName,
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'No image supplied.',
      });
    }

    tempPath = await saveTempImage(
      imageBase64,
      fileName
    );

    const raw =
      await detectDisease(tempPath);

    const result =
      normalizeResult(raw);

    deleteTempImage(tempPath);

    res.json({
      success: true,
      result,
    });

  } catch (err) {

    if (tempPath) {
      deleteTempImage(tempPath);
    }

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;