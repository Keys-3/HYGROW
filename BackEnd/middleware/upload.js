import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = "./uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname);

    cb(
      null,
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}${ext}`
    );
  },
});

export default multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});