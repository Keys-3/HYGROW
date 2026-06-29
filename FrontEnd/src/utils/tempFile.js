import fs from 'fs';
import path from 'path';

export async function saveTempImage(
  base64,
  fileName = 'leaf.jpg'
) {
  const uploadDir = './uploads';

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const filePath = path.join(
    uploadDir,
    `${Date.now()}-${fileName}`
  );

  fs.writeFileSync(
    filePath,
    Buffer.from(base64, 'base64')
  );

  return filePath;
}

export function deleteTempImage(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}