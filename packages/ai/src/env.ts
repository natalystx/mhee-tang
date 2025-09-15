import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(5421),
    RABBITMQ_URL: z.string(),
    R2_STORAGE_URL: z.string().url(),
    R2_ACCESS_KEY_ID: z.string(),
    R2_SECRET_ACCESS_KEY: z.string(),
    R2_BUCKET_NAME: z.string(),
    GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
    GOOGLE_API_KEY: z.string(),
    CORS_ORIGIN: z.string().default("http://localhost:4000"),
    GEMINI_API_KEY: z.string(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
  },

  runtimeEnv: process.env,
});
