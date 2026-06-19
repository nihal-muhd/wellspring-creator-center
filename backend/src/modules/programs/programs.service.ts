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
  input: CreateProgramInput,
) {
  return createProgramForCreator(creatorId, input);
}

export async function updateProgram(
  programId: string,
  creatorId: string,
  input: UpdateProgramInput,
) {
  const program = await updateProgramForCreator(
    programId,
    creatorId,
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
) {
  const result = await deleteProgramForCreator(programId, creatorId);

  if (result.count === 0) {
    throw new AppError("Program not found.", 404);
  }

  return {
    id: programId,
  };
}
