import { node } from "@elysiajs/node";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { env } from "./env";
import openapi from "@elysiajs/openapi";
import { transactionRouter } from "./domains/transaction/transaction.router";
import { queueConsumeService } from "./domains/queue-consume/queue-consume.service";

new Elysia({ adapter: node(), prefix: "/v1/api" })
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
  .get("/healthz", () => "OK")
  .use(transactionRouter)
  .listen(env.PORT);

queueConsumeService.init();

console.log(`🚀 Server ready at: http://localhost:${env.PORT}`);
