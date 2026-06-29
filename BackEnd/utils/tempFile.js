import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function saveTempImage(base64, fileName = "leaf.jpg") {
  const safeName = `${Date.now()}-${fileName}`;

  const filePath = path.join(uploadDir, safeName);

  await fs.promises.writeFile(
    filePath,
    Buffer.from(base64, "base64")
  );

  return filePath;
}

export async function deleteTempImage(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    console.error("Delete temp file error:", err);
  }
}