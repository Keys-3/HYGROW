import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;

export const HF_SPACE_BASE =
  process.env.HF_SPACE_BASE ||
  'https://sam120904-hydro-disease-detector.hf.space';

export const HF_UPLOAD_URL =
  `${HF_SPACE_BASE}/gradio_api/upload`;

export const HF_CALL_URL =
  `${HF_SPACE_BASE}/gradio_api/call/predict`;

export const MAX_FILE_SIZE =
  10 * 1024 * 1024;

export const MAX_POLL_ATTEMPTS = 60;

export const POLL_DELAY = 1500;