import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../lib/app-error";
import { programSessionsParamsSchema } from "./sessions.schema";
import { listProgramSessions } from "./sessions.service";

function getAuthenticatedCreatorId(req: Request): string {
  if (!req.user) {
    throw new AppError("Unauthorized.", 401);
  }

  return req.user.creatorId;
}

export async function listProgramSessionsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { programId } = programSessionsParamsSchema.parse(req.params);
    const sessions = await listProgramSessions(
      programId,
      getAuthenticatedCreatorId(req),
    );

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
}
