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

function getAuthenticatedCreatorId(req: Request): string {
  const creatorId = req.user?.creatorId;

  if (!creatorId) {
    throw new AppError("Unauthorized.", 401);
  }

  return creatorId;
}

export async function listProgramsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const programs = await listPrograms(getAuthenticatedCreatorId(req));

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
    const program = await getProgram(programId, getAuthenticatedCreatorId(req));

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
    const program = await createProgram(getAuthenticatedCreatorId(req), input);

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
    const program = await updateProgram(
      programId,
      getAuthenticatedCreatorId(req),
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
    const result = await deleteProgram(
      programId,
      getAuthenticatedCreatorId(req),
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
