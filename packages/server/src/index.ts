import { node } from "@elysiajs/node";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./lib/auth";
import { env } from "./env";
import openapi from "@elysiajs/openapi";

const app = new Elysia({ adapter: node() })
  .use(
    openapi({
      path: "/docs",
    })
  )
  .use(
    cors({
      origin: process.env.CORS_ORIGIN || "",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  )
  .mount("/auth", auth.handler)
  .get("/", () => "OK")
  .listen(env.PORT, () => {
    console.log("Server is running on http://localhost:" + env.PORT);
  });
