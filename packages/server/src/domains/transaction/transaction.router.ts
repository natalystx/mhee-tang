import { Elysia } from "elysia";
import { transactionService } from "./transaction.service";
import { betterAuth } from "@/middlewares/auth.middleware";
import {
  PaginationSchema,
  toTransactionArray,
  TransactionArraySchema,
  TransactionSchema,
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
  )
  .get(
    "/transactions/:id",
    async ({ user, params, status }) => {
      const { id } = params;
      try {
        const transaction = await transactionService.findByUid(id);
        if (transaction?.userId !== user.id) {
          return status(403, {
            message: "You do not have permission to access this transaction",
          });
        }

        if (!transaction) {
          return status(404, {
            message: "Transaction not found",
          });
        }
        return TransactionSchema.parse(transaction);
      } catch (error) {
        console.error(error);
        return status(500, {
          message: "Failed to fetch transaction",
        });
      }
    },
    {
      auth: true,
      response: {
        200: TransactionSchema,
        404: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }),
        500: z.object({ message: z.string() }),
      },
      params: z.object({ id: z.string() }),
    }
  )
  .get(
    "/transaction/range",
    async ({ user, query, status }) => {
      try {
        const transactions = await transactionService.findAllByDateRange(
          user.id,
          query.startDate,
          query.endDate
        );
        if (transactions.some((tx) => tx.userId !== user.id)) {
          return status(403, {
            message:
              "You do not have permission to access some of the transactions",
          });
        }

        return toTransactionArray(transactions);
      } catch (error) {
        return status(500, {
          message: "Failed to fetch transactions",
        });
      }
    },
    {
      auth: true,
      response: {
        200: TransactionArraySchema,
        403: z.object({ message: z.string() }),
        500: z.object({ message: z.string() }),
      },
      query: z.object({
        startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
          message: "Invalid startDate format",
        }),
        endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
          message: "Invalid endDate format",
        }),
      }),
    }
  );
