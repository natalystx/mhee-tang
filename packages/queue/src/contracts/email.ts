import { z } from "zod";

const emailPayloadSchema = z.object({
  to: z.email().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export type EmailPayload = z.infer<typeof emailPayloadSchema>;

export const emailQueue = {
  name: "email",
  payloadSchema: emailPayloadSchema,
};
