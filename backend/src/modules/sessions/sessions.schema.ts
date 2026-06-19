import { z } from "zod";

export const programSessionsParamsSchema = z.object({
  programId: z.string().trim().min(1, "Program ID is required."),
});
