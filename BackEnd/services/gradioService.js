import { Client, handle_file } from "@gradio/client";

let client;

async function getClient() {
  if (!client) {
    client = await Client.connect(process.env.HF_SPACE);
    console.log("✅ Connected to Hugging Face");
  }
  return client;
}

export async function detectDisease(imagePath) {
  console.log("Image path received:", imagePath);

  const hf = await getClient();

  const result = await hf.predict("/predict", {
    image: handle_file(imagePath),
  });

  return result;
}