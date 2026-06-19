import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../lib/app-error";
import { listAuditLogsQuerySchema } from "./audit.schema";
import { listAuditLogs } from "./audit.service";

export async function listAuditLogsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized.", 401);
    }

    const query = listAuditLogsQuerySchema.parse(req.query);
    const result = await listAuditLogs(req.user.creatorId, query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
