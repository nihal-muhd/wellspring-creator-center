import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../lib/app-error";
import {
  createProgramSchema,
  programIdParamsSchema,
  updateProgramSchema,
} from "./programs.schema";
import {
  createProgram,
  deleteProgram,
  getProgram,
  listPrograms,
  updateProgram,
} from "./programs.service";

function getAuthenticatedUser(req: Request) {
  const authenticatedUser = req.user;

  if (!authenticatedUser) {
    throw new AppError("Unauthorized.", 401);
  }

  return authenticatedUser;
}

export async function listProgramsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const programs = await listPrograms(getAuthenticatedUser(req).creatorId);

    res.status(200).json({
      success: true,
      data: programs,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProgramController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { programId } = programIdParamsSchema.parse(req.params);
    const program = await getProgram(
      programId,
      getAuthenticatedUser(req).creatorId,
    );

    res.status(200).json({
      success: true,
      data: program,
    });
  } catch (error) {
    next(error);
  }
}

export async function createProgramController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createProgramSchema.parse(req.body);
    const authenticatedUser = getAuthenticatedUser(req);
    const program = await createProgram(
      authenticatedUser.creatorId,
      authenticatedUser.userId,
      input,
    );

    res.status(201).json({
      success: true,
      data: program,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProgramController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { programId } = programIdParamsSchema.parse(req.params);
    const input = updateProgramSchema.parse(req.body);
    const authenticatedUser = getAuthenticatedUser(req);
    const program = await updateProgram(
      programId,
      authenticatedUser.creatorId,
      authenticatedUser.userId,
      input,
    );

    res.status(200).json({
      success: true,
      data: program,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProgramController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { programId } = programIdParamsSchema.parse(req.params);
    const authenticatedUser = getAuthenticatedUser(req);
    const result = await deleteProgram(
      programId,
      authenticatedUser.creatorId,
      authenticatedUser.userId,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
