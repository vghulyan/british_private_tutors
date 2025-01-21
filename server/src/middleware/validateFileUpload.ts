import { Request, Response, NextFunction } from "express";

import path from "path";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../utils/config";
import { sendResponse, STATUS } from "../interfaces";

export const validateFileUpload = (fileFieldName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const file = req.file; // For single file uploads using multer.single()
    console.log("VALIDATE FILE UPLOAD >>>> FILE: ", req.file);
    if (!file) {
      sendResponse(res, 400, STATUS.ERROR, "No file uploaded.");
      return;
    }

    // Validate file type
    const allowedFileTypes = (ALLOWED_FILE_TYPES || "jpg,jpeg,png,pdf").split(
      ","
    );
    const fileExtension = path
      .extname(file.originalname)
      .replace(".", "")
      .toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      sendResponse(
        res,
        400,
        STATUS.ERROR,
        `Invalid file type. Allowed types: ${allowedFileTypes.join(", ")}.`
      );
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      sendResponse(
        res,
        400,
        STATUS.ERROR,
        `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
      );
      return;
    }

    next();
  };
};
