import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    CORS_ORIGIN: z.url().default("http://localhost:3000"),
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url().default("http://localhost:4000"),
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z.email(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
