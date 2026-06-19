import { AppError } from "../../lib/app-error";
import { findProgramByIdForCreator } from "../programs/programs.repository";
import { findProgramSessionsForCreator } from "./sessions.repository";

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
