import { node } from "@elysiajs/node";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { env } from "./env";
import { transactionRouter } from "./domains/transaction/transaction.router";
import { tagRouter } from "./domains/tag/tag.router";
import { categoryRouter } from "./domains/category/category.router";
import { queueConsumeService } from "./domains/queue-consume/queue-consume.service";
import { documentService } from "@mhee-tang/storage";
import { initializeCategories } from "./db/seed";

export const app = new Elysia({ adapter: node(), prefix: "/v1/api" })
  .use(
    cors({
      origin: ["*"],
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  )
  .get("/healthz", () => "OK")
  .post("/clear-store", async () => {
    await documentService.deleteDirectory("transactions");
    return { message: "Store cleared" };
  })
  .use(transactionRouter)
  .use(tagRouter)
  .use(categoryRouter)
  .listen(env.PORT, () => {
    queueConsumeService.init();
    initializeCategories();
    console.log("Queue consumer service initialized");
    console.log(`🚀 Server ready at: http://localhost:${env.PORT}`);
  });
