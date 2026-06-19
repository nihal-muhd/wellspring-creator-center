import type { RequestHandler } from "express";
import multer from "multer";

import { AppError } from "../../lib/app-error";

const maxCsvSize = 10 * 1024 * 1024;

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxCsvSize,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.originalname.toLowerCase().endsWith(".csv")) {
      callback(new AppError("Choose a CSV file.", 400));
      return;
    }

    callback(null, true);
  },
});

export const uploadSessionCsv: RequestHandler = (req, res, next) => {
  csvUpload.single("file")(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        next(new AppError("Choose a CSV file smaller than 10 MB.", 400));
        return;
      }

      next(new AppError("The CSV upload could not be processed.", 400));
      return;
    }

    next(error);
  });
};
