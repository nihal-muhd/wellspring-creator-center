import { AppError } from "../../lib/app-error";
import {
  assertManagedS3File,
  deleteS3ObjectsBestEffort,
} from "../../lib/s3";
import { findProgramByIdForCreator } from "../programs/programs.repository";
import {
  createSessionForCreator,
  deleteSessionForCreator,
  findProgramSessionsForCreator,
  findSessionByIdForCreator,
  reorderSessionsForCreator,
  updateSessionForCreator,
} from "./sessions.repository";
import type {
  CreateSessionInput,
  UpdateSessionInput,
} from "./sessions.schema";

export async function listProgramSessions(
  programId: string,
  creatorId: string,
) {
  const program = await findProgramByIdForCreator(programId, creatorId);

  if (!program) {
    throw new AppError("Program not found.", 404);
  }

  return findProgramSessionsForCreator(programId, creatorId);
}

export async function createSession(
  programId: string,
  creatorId: string,
  actorId: string,
  input: CreateSessionInput,
) {
  assertManagedS3File(
    creatorId,
    programId,
    "sessions",
    input.mediaUrl,
    input.mediaKey,
  );

  const session = await createSessionForCreator(
    programId,
    creatorId,
    actorId,
    input,
  );

  if (!session) {
    throw new AppError("Program not found.", 404);
  }

  return session;
}

export async function reorderSessions(
  programId: string,
  creatorId: string,
  actorId: string,
  sessionIds: string[],
) {
  const result = await reorderSessionsForCreator(
    programId,
    creatorId,
    actorId,
    sessionIds,
  );

  if (result.status === "program-not-found") {
    throw new AppError("Program not found.", 404);
  }

  if (result.status === "invalid-order") {
    throw new AppError(
      "Session order must include every session in this program exactly once.",
      400,
    );
  }

  return result.sessions;
}

export async function updateSession(
  sessionId: string,
  creatorId: string,
  actorId: string,
  input: UpdateSessionInput,
) {
  const existingSession = await findSessionByIdForCreator(
    sessionId,
    creatorId,
  );

  if (!existingSession) {
    throw new AppError("Session not found.", 404);
  }

  if ("mediaUrl" in input || "mediaKey" in input) {
    assertManagedS3File(
      creatorId,
      existingSession.programId,
      "sessions",
      input.mediaUrl,
      input.mediaKey,
    );
  }

  const session = await updateSessionForCreator(
    sessionId,
    creatorId,
    actorId,
    input,
  );

  if (!session) {
    throw new AppError("Session not found.", 404);
  }

  if (
    existingSession.mediaKey &&
    existingSession.mediaKey !== session.mediaKey
  ) {
    await deleteS3ObjectsBestEffort([existingSession.mediaKey]);
  }

  return session;
}

export async function deleteSession(
  sessionId: string,
  creatorId: string,
  actorId: string,
) {
  const result = await deleteSessionForCreator(
    sessionId,
    creatorId,
    actorId,
  );

  if (!result) {
    throw new AppError("Session not found.", 404);
  }

  await deleteS3ObjectsBestEffort([result.mediaKey]);

  return {
    id: result.id,
  };
}
