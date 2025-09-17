import { Elysia } from "elysia";
import { transactionService } from "./transaction.service";
import { betterAuth } from "@/middlewares/auth.middleware";
import {
  PaginationSchema,
  toTransactionArray,
  TransactionArraySchema,
  UploadTransactionSchema,
} from "./transaction.type";
import { z } from "zod";

export const transactionRouter = new Elysia({ name: "transaction-router" })
  .use(betterAuth)
  .get(
    "/transactions",
    async ({ user, body }) => {
      const { page, pageSize } = body;
      try {
        const transactions = await transactionService.findManyByUserId(
          user.id,
          { page, pageSize }
        );
        return toTransactionArray(transactions);
      } catch (error) {
        return { message: "Failed to fetch transactions" };
      }
    },
    {
      auth: true,
      body: PaginationSchema,
      response: {
        200: TransactionArraySchema,
        500: z.object({ message: z.string() }),
      },
    }
  )
  .post(
    "/transactions",
    async ({ user, body }) => {
      try {
        console.log("Transaction creation queued", body, user.id);
        await transactionService.queueTransactionExtract(body, user.id);
        return { message: "Transaction creation in progress" };
      } catch (error) {
        return { message: "Failed to create transaction" };
      }
    },
    {
      auth: true,
      body: UploadTransactionSchema,
      contentType: "multipart/form-data",
      response: {
        200: z.object({ message: z.string() }),
        500: z.object({ message: z.string() }),
      },
    }
  );
