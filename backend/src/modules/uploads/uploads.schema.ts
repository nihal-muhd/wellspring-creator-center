import { z } from "zod";

export const presignUploadSchema = z.object({
  uploadType: z.enum(["PROGRAM_IMAGE", "SESSION_MEDIA"]),
  programId: z.string().trim().min(1, "Program ID is required."),
  fileName: z
    .string()
    .trim()
    .min(1, "File name is required.")
    .max(255, "File name must be 255 characters or fewer."),
  contentType: z
    .string()
    .trim()
    .min(1, "Content type is required.")
    .max(255, "Content type must be 255 characters or fewer."),
  fileSize: z
    .number()
    .int("File size must be a whole number.")
    .positive("File size must be greater than zero."),
});

export const presignReadSchema = z.object({
  fileKey: z
    .string()
    .trim()
    .min(1, "File key is required.")
    .max(1024, "File key must be 1024 characters or fewer."),
});

export type PresignUploadInput = z.infer<typeof presignUploadSchema>;
export type PresignReadInput = z.infer<typeof presignReadSchema>;
