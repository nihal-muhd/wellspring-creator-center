import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../lib/app-error";
import { programSessionsParamsSchema } from "../sessions/sessions.schema";
import { importProgramSessions } from "./imports.service";
import { importRequestSchema } from "./imports.schema";

function getAuthenticatedUser(req: Request) {
  if (!req.user) {
    throw new AppError("Unauthorized.", 401);
  }

  return req.user;
}

export async function importProgramSessionsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { programId } = programSessionsParamsSchema.parse(req.params);
    const { clientImportId } = importRequestSchema.parse(req.body);
    const authenticatedUser = getAuthenticatedUser(req);
    const result = await importProgramSessions(
      programId,
      authenticatedUser.creatorId,
      authenticatedUser.userId,
      clientImportId,
      req.file,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
