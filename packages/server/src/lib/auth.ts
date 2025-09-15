import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "../db";
import * as schema from "../db/schema/auth";
import { env } from "@/env";
import { emailOTP } from "better-auth/plugins";
import { sendEmail } from "./email";
import { openAPI } from "better-auth/plugins";
import { UID_PREFIX } from "@/constants/uid-prefix";
import { uid } from "@/utils/uid";

export const auth = betterAuth({
  basePath: "/auth",
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
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const userUID = uid(UID_PREFIX.USER);
          return { data: { ...user, uid: userUID } };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const sessionUID = uid(UID_PREFIX.SESSION);
          return { data: { ...session, uid: sessionUID } };
        },
      },
    },
  },

  plugins: [
    openAPI(),
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
