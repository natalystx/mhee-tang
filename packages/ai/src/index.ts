import { node } from "@elysiajs/node";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { env } from "./env";
import { transactionConsumer } from "./domain/transaction/transaction.consumer";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

new Elysia({ adapter: node(), prefix: "/v1/api" })
  .use(
    cors({
      origin: process.env.CORS_ORIGIN || "",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  )
  .get("/healthz", () => "OK")
  .get("/hi", async () => {
    const { text, totalUsage } = await generateText({
      model: google("gemini-2.5-flash"),
      temperature: 0.1,
      maxRetries: 2,
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 512,
            includeThoughts: true,
          },
        },
      },
      prompt: "hi",
    });

    return { text };
  })
  .listen(env.PORT, () => {
    transactionConsumer.consume();

    console.log(`🚀 AI ready at: http://localhost:${env.PORT}`);
  });
