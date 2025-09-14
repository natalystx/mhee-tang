import "dotenv/config"
import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    R2_STORAGE_URL: z
      .string()
      .url({ message: "Invalid STORAGE_URL. It must be a valid URL." }),
    R2_SECRET_ACCESS_KEY: z
      .string()
      .min(1, { message: "R2_SECRET_ACCESS_KEY must not be empty." }),
    R2_ACCESS_KEY_ID: z
      .string()
      .min(1, { message: "R2_ACCESS_KEY_ID must not be empty." }),
    R2_BUCKET_NAME: z.string().min(1),
  },

  runtimeEnv: process.env,
})
