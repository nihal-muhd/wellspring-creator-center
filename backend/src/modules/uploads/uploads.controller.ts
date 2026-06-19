import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../lib/app-error";
import {
  presignReadSchema,
  presignUploadSchema,
} from "./uploads.schema";
import {
  createPresignedReadUrl,
  createPresignedUpload,
} from "./uploads.service";

export async function createPresignedUploadController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized.", 401);
    }

    const input = presignUploadSchema.parse(req.body);
    const upload = await createPresignedUpload(
      req.user.creatorId,
      req.user.userId,
      input,
    );

    res.status(201).json({
      success: true,
      data: upload,
    });
  } catch (error) {
    next(error);
  }
}

export async function createPresignedReadController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized.", 401);
    }

    const input = presignReadSchema.parse(req.body);
    const read = await createPresignedReadUrl(
      req.user.creatorId,
      input,
    );

    res.status(200).json({
      success: true,
      data: read,
    });
  } catch (error) {
    next(error);
  }
}
