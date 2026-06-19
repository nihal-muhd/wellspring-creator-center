import { z } from "zod";

import { AuditAction } from "../../generated/prisma/client";

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must use YYYY-MM-DD format.")
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)), {
    message: "Provide a valid date.",
  });

export const listAuditLogsQuerySchema = z
  .object({
    action: z.enum(AuditAction).optional(),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
    search: z.string().trim().max(120).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .refine(
    (input) =>
      !input.startDate ||
      !input.endDate ||
      input.startDate <= input.endDate,
    {
      message: "Start date must be on or before end date.",
      path: ["endDate"],
    },
  );

export type ListAuditLogsQuery = z.infer<
  typeof listAuditLogsQuerySchema
>;
