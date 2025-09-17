import { treaty } from "@elysiajs/eden";
import { app } from "@mhee-tang/server";
import { env } from "@/env";
import * as SecureStore from "expo-secure-store";
import { authClient } from "./auth";
const cookies = authClient.getCookie();
const headers = {
  Cookie: cookies,
};
// @ts-ignore
export const apiClient = treaty<typeof app>("http://192.168.1.173:4000", {
  headers: {
    credentials: "omit",
    ...headers,
  },
});
