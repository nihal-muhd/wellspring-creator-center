import { z } from "zod";

export const programSessionsParamsSchema = z.object({
  programId: z.string().trim().min(1, "Program ID is required."),
});

export const sessionIdParamsSchema = z.object({
  sessionId: z.string().trim().min(1, "Session ID is required."),
});

const optionalTextSchema = z
  .string()
  .trim()
  .max(120, "Instructor name must be 120 characters or fewer.")
  .optional()
  .transform((value) => value || null);

const sessionFields = {
  title: z
    .string()
    .trim()
    .min(1, "Session title is required.")
    .max(160, "Session title must be 160 characters or fewer."),
  duration: z
    .number()
    .int("Duration must resolve to whole minutes.")
    .min(1, "Duration must be at least one minute.")
    .max(1440, "Duration must be 24 hours or fewer."),
  instructorName: optionalTextSchema,
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Tags cannot be empty.")
        .max(40, "Each tag must be 40 characters or fewer."),
    )
    .max(10, "Use 10 tags or fewer.")
    .default([]),
  mediaType: z.enum(["AUDIO", "VIDEO"]).nullable().optional(),
  mediaUrl: z
    .union([z.url("Media URL must be a valid URL."), z.literal(""), z.null()])
    .optional()
    .transform((value) => value || null),
  mediaKey: z
    .union([
      z
        .string()
        .trim()
        .max(1024, "Media key must be 1024 characters or fewer."),
      z.null(),
    ])
    .optional()
    .transform((value) => value || null),
};

export const createSessionSchema = z.object(sessionFields);

export const updateSessionSchema = z
  .object(sessionFields)
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "Provide at least one field to update.",
  });

export const reorderSessionsSchema = z
  .object({
    sessionIds: z
      .array(z.string().trim().min(1, "Session IDs cannot be empty."))
      .min(1, "At least one session ID is required."),
  })
  .refine(
    ({ sessionIds }) => new Set(sessionIds).size === sessionIds.length,
    {
      message: "Session IDs must not contain duplicates.",
      path: ["sessionIds"],
    },
  );

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type ReorderSessionsInput = z.infer<typeof reorderSessionsSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
