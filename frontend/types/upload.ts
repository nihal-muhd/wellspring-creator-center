export type UploadType = "PROGRAM_IMAGE" | "SESSION_MEDIA";

export type PresignedUpload = {
  uploadUrl: string;
  fileUrl: string;
  fileKey: string;
  expiresIn: number;
};

export type PresignedRead = {
  readUrl: string;
  expiresIn: number;
};
