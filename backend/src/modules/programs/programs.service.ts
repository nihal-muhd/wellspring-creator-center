import { AppError } from "../../lib/app-error";
import {
  createProgramForCreator,
  deleteProgramForCreator,
  findProgramByIdForCreator,
  findProgramsForCreator,
  updateProgramForCreator,
} from "./programs.repository";
import type {
  CreateProgramInput,
  UpdateProgramInput,
} from "./programs.schema";

export async function listPrograms(creatorId: string) {
  return findProgramsForCreator(creatorId);
}

export async function getProgram(programId: string, creatorId: string) {
  const program = await findProgramByIdForCreator(programId, creatorId);

  if (!program) {
    throw new AppError("Program not found.", 404);
  }

  return program;
}

export async function createProgram(
  creatorId: string,
  actorId: string,
  input: CreateProgramInput,
) {
  return createProgramForCreator(creatorId, actorId, input);
}

export async function updateProgram(
  programId: string,
  creatorId: string,
  actorId: string,
  input: UpdateProgramInput,
) {
  const program = await updateProgramForCreator(
    programId,
    creatorId,
    actorId,
    input,
  );

  if (!program) {
    throw new AppError("Program not found.", 404);
  }

  return program;
}

export async function deleteProgram(
  programId: string,
  creatorId: string,
  actorId: string,
) {
  const result = await deleteProgramForCreator(
    programId,
    creatorId,
    actorId,
  );

  if (!result) {
    throw new AppError("Program not found.", 404);
  }

  return result;
}
