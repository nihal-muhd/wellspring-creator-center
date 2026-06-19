import { AxiosError } from "axios";

import { api } from "@/lib/api";
import type {
  ProgramApiErrorResponse,
  ProgramApiRecord,
  ProgramApiSuccessResponse,
  ProgramMutationInput,
  ProgramSummary,
} from "@/types/program";

function mapProgram(record: ProgramApiRecord): ProgramSummary {
  return {
    id: record.id,
    title: record.title,
    description: record.description ?? "",
    sessionCount: record._count.sessions,
    coverImageUrl: record.coverImageUrl ?? undefined,
    coverImageKey: record.coverImageKey ?? undefined,
  };
}

export async function getPrograms(): Promise<ProgramSummary[]> {
  const response =
    await api.get<ProgramApiSuccessResponse<ProgramApiRecord[]>>("/programs");

  return response.data.data.map(mapProgram);
}

export async function getProgram(
  programId: string,
): Promise<ProgramSummary> {
  const response = await api.get<
    ProgramApiSuccessResponse<ProgramApiRecord>
  >(`/programs/${programId}`);

  return mapProgram(response.data.data);
}

export async function createProgram(
  input: ProgramMutationInput,
): Promise<ProgramSummary> {
  const response = await api.post<
    ProgramApiSuccessResponse<ProgramApiRecord>
  >("/programs", input);

  return mapProgram(response.data.data);
}

export async function updateProgram(
  programId: string,
  input: ProgramMutationInput,
): Promise<ProgramSummary> {
  const response = await api.patch<
    ProgramApiSuccessResponse<ProgramApiRecord>
  >(`/programs/${programId}`, input);

  return mapProgram(response.data.data);
}

export async function deleteProgram(programId: string): Promise<void> {
  await api.delete(`/programs/${programId}`);
}

export function isUnauthorizedProgramError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 401;
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as
      | ProgramApiErrorResponse
      | undefined;

    if (response?.error) {
      return response.error;
    }
  }

  return fallback;
}

export function getProgramsErrorMessage(error: unknown): string {
  return getApiErrorMessage(
    error,
    "We could not load your programs. Please try again.",
  );
}

export function getProgramMutationErrorMessage(error: unknown): string {
  return getApiErrorMessage(
    error,
    "We could not save this program. Please try again.",
  );
}

export function getProgramDeleteErrorMessage(error: unknown): string {
  return getApiErrorMessage(
    error,
    "We could not delete this program. Please try again.",
  );
}
