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
  trustedOrigins: [env.CORS_ORIGIN, "mhee-tang://", "http://localhost:8081", "http://localhost:19006", "http://127.0.0.1:8081"],
  advanced: {
    defaultCookieAttributes: {          
      httpOnly: true,
      sameSite: "none",
      secure: true,
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
  },

  user: {
    additionalFields: {
      englishName: {
        type: "string",
        required: false,
        input: true,
        defaultValue: () => null,
      }
    },
  },
  plugins: [
    openAPI(),
    expo(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        switch (type) {
          case "sign-in":
            console.log("Sending sign-in OTP to:", email, "OTP:", otp);
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
