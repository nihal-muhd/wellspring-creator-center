import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../lib/app-error";
import {
  createSessionSchema,
  programSessionsParamsSchema,
  sessionIdParamsSchema,
  updateSessionSchema,
} from "./sessions.schema";
import {
  createSession,
  listProgramSessions,
  updateSession,
} from "./sessions.service";

function getAuthenticatedUser(req: Request) {
  if (!req.user) {
    throw new AppError("Unauthorized.", 401);
  }

  return req.user;
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
      getAuthenticatedUser(req).creatorId,
    );

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
}

export async function createSessionController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { programId } = programSessionsParamsSchema.parse(req.params);
    const input = createSessionSchema.parse(req.body);
    const authenticatedUser = getAuthenticatedUser(req);
    const session = await createSession(
      programId,
      authenticatedUser.creatorId,
      authenticatedUser.userId,
      input,
    );

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSessionController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { sessionId } = sessionIdParamsSchema.parse(req.params);
    const input = updateSessionSchema.parse(req.body);
    const authenticatedUser = getAuthenticatedUser(req);
    const session = await updateSession(
      sessionId,
      authenticatedUser.creatorId,
      authenticatedUser.userId,
      input,
    );

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
}
