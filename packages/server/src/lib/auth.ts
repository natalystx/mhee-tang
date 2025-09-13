import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "../db";
import * as schema from "../db/schema/auth";
import { env } from "@/env";
import { emailOTP } from "better-auth/plugins";
import { sendEmail } from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN || "", "my-better-t-app://"],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [
    expo(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        switch (type) {
          case "sign-in":
            await sendEmail(
              email,
              "Your sign-in code",
              `<p>Your sign-in code is: <strong>${otp}</strong></p>`
            );
            break;
          case "email-verification":
            await sendEmail(
              email,
              "Email Verification",
              `<p>Your email verification code is: <strong>${otp}</strong></p>`
            );
            break;
          case "forget-password":
            await sendEmail(
              email,
              "Password Reset",
              `<p>Your password reset code is: <strong>${otp}</strong></p>`
            );
            break;
          default:
            break;
        }
      },
    }),
  ],
});

export type Auth = typeof auth;
