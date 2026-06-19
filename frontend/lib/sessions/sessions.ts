import { AxiosError } from "axios";

import { api } from "@/lib/api";
import type {
  ProgramApiErrorResponse,
  ProgramApiSuccessResponse,
} from "@/types/program";
import type {
  SessionApiRecord,
  SessionMutationInput,
  SessionSummary,
} from "@/types/session";

function mapSession(record: SessionApiRecord): SessionSummary {
  return {
    id: record.id,
    programId: record.programId,
    title: record.title,
    duration: record.duration,
    position: record.position,
    instructorName: record.instructorName ?? undefined,
    tags: record.tags,
    mediaType: record.mediaType ?? undefined,
    mediaUrl: record.mediaUrl ?? undefined,
    mediaKey: record.mediaKey ?? undefined,
    thumbnailUrl: record.thumbnailUrl ?? undefined,
  };
}

export async function getProgramSessions(
  programId: string,
): Promise<SessionSummary[]> {
  const response = await api.get<
    ProgramApiSuccessResponse<SessionApiRecord[]>
  >(`/programs/${programId}/sessions`);

  return response.data.data.map(mapSession);
}

export async function createSession(
  programId: string,
  input: SessionMutationInput,
): Promise<SessionSummary> {
  const response = await api.post<
    ProgramApiSuccessResponse<SessionApiRecord>
  >(`/programs/${programId}/sessions`, input);

  return mapSession(response.data.data);
}

export async function updateSession(
  sessionId: string,
  input: SessionMutationInput,
): Promise<SessionSummary> {
  const response = await api.patch<
    ProgramApiSuccessResponse<SessionApiRecord>
  >(`/sessions/${sessionId}`, input);

  return mapSession(response.data.data);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await api.delete(`/sessions/${sessionId}`);
}

export function getSessionsErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as
      | ProgramApiErrorResponse
      | undefined;

    if (response?.error) {
      return response.error;
    }
  }

  return "We could not load this program and its sessions. Please try again.";
}

export function getSessionMutationErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as
      | ProgramApiErrorResponse
      | undefined;

    if (response?.error) {
      return response.error;
    }
  }

  return "We could not save this session. Please try again.";
}

export function getSessionDeleteErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as
      | ProgramApiErrorResponse
      | undefined;

    if (response?.error) {
      return response.error;
    }
  }

  return "We could not delete this session. Please try again.";
}
