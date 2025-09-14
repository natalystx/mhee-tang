import { Elysia } from "elysia";
import { transactionService } from "./transaction.service";
import { betterAuth } from "@/middlewares/auth.middleware";
import { toTransactionArray, TransactionArraySchema } from "./transaction.type";
import { z } from "zod";

export const transactionRouter = new Elysia({ name: "transaction-router" })
  .use(betterAuth)
  .get(
    "/transactions",
    async ({ user }) => {
      try {
        const transactions = await transactionService.findManyByUserId(user.id);

        return toTransactionArray(transactions);
      } catch (error) {
        return { message: "Failed to fetch transactions" };
      }
    },
    {
      auth: true,
      response: {
        200: TransactionArraySchema,
        500: z.object({ message: z.string() }),
      },
    }
  );
