import { z } from "zod";

export const aiResponseSchema = z.object({
  runtime: z.string(),
  languages: z.array(z.string()),
  readme: z.string().min(50),
});
