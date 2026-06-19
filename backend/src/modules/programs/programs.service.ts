import { AppError } from "../../lib/app-error";
import {
  assertManagedS3File,
  deleteS3ObjectsBestEffort,
} from "../../lib/s3";
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
  if (input.coverImageUrl || input.coverImageKey) {
    throw new AppError(
      "Create the program before uploading its cover image.",
      400,
    );
  }

  return createProgramForCreator(creatorId, actorId, input);
}

export async function updateProgram(
  programId: string,
  creatorId: string,
  actorId: string,
  input: UpdateProgramInput,
) {
  const existingProgram = await findProgramByIdForCreator(
    programId,
    creatorId,
  );

  if (!existingProgram) {
    throw new AppError("Program not found.", 404);
  }

  if ("coverImageUrl" in input || "coverImageKey" in input) {
    assertManagedS3File(
      creatorId,
      programId,
      "images",
      input.coverImageUrl,
      input.coverImageKey,
    );
  }

  const program = await updateProgramForCreator(
    programId,
    creatorId,
    actorId,
    input,
  );

  if (!program) {
    throw new AppError("Program not found.", 404);
  }

  if (
    existingProgram.coverImageKey &&
    existingProgram.coverImageKey !== program.coverImageKey
  ) {
    await deleteS3ObjectsBestEffort([existingProgram.coverImageKey]);
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

  await deleteS3ObjectsBestEffort(result.deletedFileKeys);

  return {
    id: result.id,
  };
}
