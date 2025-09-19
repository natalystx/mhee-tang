import { z } from "zod";

export const tagInputSchema = z.object({
  name: z.string(),
  userId: z.string(),
});

export type TagInput = z.infer<typeof tagInputSchema>;
