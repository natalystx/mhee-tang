import { Elysia } from "elysia";
import { transactionService } from "./transaction.service";
import { betterAuth } from "@/middlewares/auth.middleware";
import {
  AggregateByMonthSchema,
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
      const { page, pageSize, descending } = body;
      try {
        const transactions = await transactionService.findManyByUserId({
          page,
          pageSize,
          descending,
          userId: user.id,
        });
        return toTransactionArray(transactions);
      } catch (error) {
        return { message: "Failed to fetch transactions" };
      }
    },
    {
      auth: true,
      body: PaginationSchema.extend({
        descending: z.boolean().optional().default(true),
      }),
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
    "/transactions/range",
    async ({ user, query, status }) => {
      try {
        const transactions = await transactionService.findAllByDateRange({
          userId: user.id,
          startDateISO: query.startDate,
          endDateISO: query.endDate,
          descending: query.descending,
          page: query.page,
          pageSize: query.pageSize,
        });
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
      query: PaginationSchema.extend({
        startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
          message: "Invalid startDate format",
        }),
        endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
          message: "Invalid endDate format",
        }),
        descending: z.boolean().optional().default(true),
      }),
    }
  )
  .get(
    "/transactions/getByCategoryId",
    async ({ user, query, status }) => {
      try {
        const transactions = await transactionService.getByCategoryIds({
          userId: user.id,
          categoryIds: query.categoryIds,
          startDate: query.startDate,
          endDate: query.endDate,
          descending: query.descending,
          page: query.page,
          pageSize: query.pageSize,
        });
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
      query: PaginationSchema.extend({
        categoryIds: z
          .array(z.string())
          .min(1, { message: "categoryId is required" }),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        descending: z.boolean().optional().default(true),
      }),
    }
  )
  .get(
    "/transactions/getByTagIds",
    async ({ user, query, status }) => {
      try {
        const transactions = await transactionService.getByTagIds({
          userId: user.id,
          tagsId: query.tagsId,
          startDate: query.startDate,
          endDate: query.endDate,
          descending: query.descending,
          page: query.page,
          pageSize: query.pageSize,
        });
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
      query: PaginationSchema.extend({
        tagsId: z.array(z.string()).min(1, { message: "tagsId is required" }),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        descending: z.boolean().optional().default(true),
      }),
    }
  )
  .get(
    "/transactions/aggregateByMonth",
    async ({ user, query, status }) => {
      try {
        const aggregation = await transactionService.getAggregateByMonth({
          userId: user.id,
          dateISO: query.dateISO,
          type: query.type,
        });
        return { aggregation };
      } catch (error) {
        console.error(error);
        return status(500, {
          message: "Failed to aggregate transactions",
        });
      }
    },
    {
      auth: true,
      response: {
        200: z.object({ aggregation: z.number() }),
        500: z.object({ message: z.string() }),
      },
      query: AggregateByMonthSchema.omit({ userId: true }),
    }
  );
