import { AppError } from "../../lib/app-error";
import { findProgramByIdForCreator } from "../programs/programs.repository";
import {
  createSessionForCreator,
  deleteSessionForCreator,
  findProgramSessionsForCreator,
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
  const session = await updateSessionForCreator(
    sessionId,
    creatorId,
    actorId,
    input,
  );

  if (!session) {
    throw new AppError("Session not found.", 404);
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

  return result;
}
