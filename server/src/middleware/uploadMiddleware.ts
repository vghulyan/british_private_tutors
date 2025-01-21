// src/middleware/uploadMiddleware.ts

import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../utils/config";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const fileTypes = ALLOWED_FILE_TYPES.split(",");
  const ext = path.extname(file.originalname).toLowerCase().substring(1);

  if (fileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});
