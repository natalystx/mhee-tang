import { treaty } from "@elysiajs/eden";
import { app } from "@mhee-tang/server";
import { env } from "@/env";
import { authClient } from "./auth";
const cookies = authClient.getCookie();
const headers = {
  Cookie: cookies,
};

export const apiClient = treaty<typeof app>(env.EXPO_PUBLIC_BASE_API_ENDPOINT, {
  headers: {
    credentials: "omit",
    ...headers,
  },
});
