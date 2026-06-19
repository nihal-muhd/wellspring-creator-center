import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createPresignedReadController,
  createPresignedUploadController,
} from "./uploads.controller";

export const uploadsRouter = Router();

uploadsRouter.use(authMiddleware);
uploadsRouter.post("/presign", createPresignedUploadController);
uploadsRouter.post("/read-url", createPresignedReadController);
