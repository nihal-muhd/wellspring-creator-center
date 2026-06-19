import { AxiosError } from "axios";

import { api } from "@/lib/api";
import type {
  ProgramApiErrorResponse,
  ProgramApiSuccessResponse,
} from "@/types/program";
import type {
  PresignedRead,
  PresignedUpload,
  UploadType,
} from "@/types/upload";

export async function uploadFile(
  programId: string,
  uploadType: UploadType,
  file: File,
): Promise<PresignedUpload> {
  const response = await api.post<
    ProgramApiSuccessResponse<PresignedUpload>
  >("/uploads/presign", {
    uploadType,
    programId,
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
  });
  const upload = response.data.data;
  const uploadResponse = await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("The file could not be uploaded to storage.");
  }

  return upload;
}

export async function getReadUrl(fileKey: string): Promise<string> {
  const response = await api.post<
    ProgramApiSuccessResponse<PresignedRead>
  >("/uploads/read-url", {
    fileKey,
  });

  return response.data.data.readUrl;
}

export function getUploadErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as
      | ProgramApiErrorResponse
      | undefined;

    if (response?.error) {
      return response.error;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "We could not upload this file. Please try again.";
}
