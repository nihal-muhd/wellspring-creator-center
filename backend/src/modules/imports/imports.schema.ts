import { z } from "zod";

export const importRequestSchema = z.object({
  clientImportId: z
    .string()
    .trim()
    .min(1, "Client import ID is required.")
    .max(120, "Client import ID must be 120 characters or fewer."),
});

const optionalCsvText = z
  .string()
  .trim()
  .max(120, "Instructor name must be 120 characters or fewer.")
  .transform((value) => value || null);

const optionalCsvUrl = z
  .string()
  .trim()
  .transform((value) => value || null)
  .refine((value) => value === null || z.url().safeParse(value).success, {
    message: "Media URL must be a valid URL.",
  });

export const importSessionRowSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Session title is required.")
    .max(160, "Session title must be 160 characters or fewer."),
  duration: z
    .string()
    .trim()
    .min(1, "Duration is required.")
    .transform((value, context) => {
      const hours = Number(value);
      const minutes = Math.round(hours * 60);

      if (
        !Number.isFinite(hours) ||
        hours <= 0 ||
        minutes < 1 ||
        minutes > 1440
      ) {
        context.addIssue({
          code: "custom",
          message: "Duration must be between 0 and 24 hours.",
        });
        return z.NEVER;
      }

      return minutes;
    }),
  position: z
    .string()
    .trim()
    .transform((value, context) => {
      if (!value) {
        return null;
      }

      const position = Number(value);

      if (!Number.isInteger(position) || position < 1) {
        context.addIssue({
          code: "custom",
          message: "Position must be a positive whole number.",
        });
        return z.NEVER;
      }

      return position;
    }),
  instructorName: optionalCsvText,
  tags: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    )
    .refine((tags) => tags.length <= 10, {
      message: "Use 10 tags or fewer.",
    })
    .refine((tags) => tags.every((tag) => tag.length <= 40), {
      message: "Each tag must be 40 characters or fewer.",
    }),
  mediaType: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .pipe(z.union([z.enum(["AUDIO", "VIDEO"]), z.literal("")]))
    .transform((value) => value || null),
  mediaUrl: optionalCsvUrl,
});

export type ImportSessionRowInput = z.infer<typeof importSessionRowSchema>;

export type ImportRowError = {
  row: number;
  field?: string;
  message: string;
};

export type ValidImportRow = ImportSessionRowInput & {
  row: number;
  sourceIndex: number;
};
