import { AxiosError } from "axios";

import { api } from "@/lib/api";
import type {
  ProgramApiErrorResponse,
  ProgramApiSuccessResponse,
} from "@/types/program";
import type { SessionImportResult } from "@/types/session-import";

export async function importProgramSessions(
  programId: string,
  file: File,
  clientImportId: string,
): Promise<SessionImportResult> {
  const formData = new FormData();
  formData.append("clientImportId", clientImportId);
  formData.append("file", file);

  const response = await api.post<
    ProgramApiSuccessResponse<SessionImportResult>
  >(`/programs/${programId}/sessions/import`, formData);

  return response.data.data;
}

export function getSessionImportErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as
      | ProgramApiErrorResponse
      | undefined;

    if (response?.error) {
      return response.error;
    }
  }

  return "We could not import this CSV file. Please try again.";
}

export function isUnauthorizedSessionImportError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 401;
}
