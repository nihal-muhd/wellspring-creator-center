import { z } from "zod";

const nullableUrlSchema = z
  .union([
    z.url("Cover image URL must be a valid URL."),
    z.literal(""),
    z.null(),
  ])
  .transform((value) => value || null);

const nullableKeySchema = z
  .union([
    z
      .string()
      .trim()
      .max(1024, "Cover image key must be 1024 characters or fewer."),
    z.null(),
  ])
  .transform((value) => value || null);

const programFields = {
  title: z
    .string()
    .trim()
    .min(1, "Program title is required.")
    .max(120, "Program title must be 120 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(500, "Program description must be 500 characters or fewer.")
    .optional()
    .transform((value) => value || null),
  coverImageUrl: nullableUrlSchema.optional(),
  coverImageKey: nullableKeySchema.optional(),
};

export const programIdParamsSchema = z.object({
  programId: z.string().trim().min(1, "Program ID is required."),
});

export const createProgramSchema = z.object(programFields);

export const updateProgramSchema = z
  .object(programFields)
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "Provide at least one field to update.",
  });

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
