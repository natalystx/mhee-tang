import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { env } from "@/env";
import {
  emailOTPClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: env.EXPO_PUBLIC_API_ENDPOINT + "/auth",

  plugins: [
    inferAdditionalFields({
      user: {
        englishName: {
          type: "string",
          required: false,
        },
      },
    }),
    expoClient({
      scheme: "mhee-tang",
      storagePrefix: "mhee-tang",
      storage: SecureStore,
    }),
    emailOTPClient(),
  ],
});
