import { Elysia } from "elysia";
import { z } from "zod";
import { betterAuth } from "@/middlewares/auth.middleware";

import { budgetService } from "./budget.service";
import {
  CreateBudgetSchema,
  UpdateBudgetSchema,
  BudgetSchema,
  PaginationSchema,
  BudgetProgressSchema,
  BudgetOutputSchema,
} from "./budget.type";

export const budgetRouter = new Elysia({ name: "budget-router" })
  .use(betterAuth)
  .get(
    "/budgets",
    async ({ user, query }) => {
      try {
        const page = query.page;
        const pageSize = query.pageSize;
        const includeDeleted = query.includeDeleted ?? false;

        const budgets = await budgetService.findManyByUserId({
          userId: user.id,
          page,
          pageSize,
          includeDeleted,
        });

        return { data: z.array(BudgetSchema).parse(budgets) };
      } catch (error: any) {
        return {
          error: true,
          message: error.message || "Failed to fetch budgets",
        };
      }
    },
    {
      auth: true,
      query: PaginationSchema.extend({
        includeDeleted: z
          .boolean()
          .optional()
          .describe("Include deleted budgets"),
      }),
      response: {
        200: z.object({
          data: z.array(BudgetSchema),
        }),
        500: z.object({
          error: z.boolean(),
          message: z.string(),
        }),
      },
    }
  )
  .get(
    "/budgets/:uid",
    async ({ user, params }) => {
      try {
        const { uid } = params;

        const budget = await budgetService.findByUid(uid);

        if (!budget) {
          return {
            error: true,
            message: "Budget not found",
            status: 404,
          };
        }

        // Ensure user owns this budget
        if (budget.userId !== user.id) {
          return {
            error: true,
            message: "Not authorized to view this budget",
            status: 403,
          };
        }

        return { data: BudgetOutputSchema.parse(budget) };
      } catch (error: any) {
        return {
          error: true,
          message: error.message || "Failed to fetch budget",
        };
      }
    },
    {
      auth: true,
      params: z.object({
        uid: z.string(),
      }),
      response: {
        200: z.object({
          data: BudgetOutputSchema,
        }),
        404: z.object({
          error: z.boolean(),
          message: z.string(),
          status: z.number(),
        }),
        403: z.object({
          error: z.boolean(),
          message: z.string(),
          status: z.number(),
        }),
        500: z.object({
          error: z.boolean(),
          message: z.string(),
        }),
      },
    }
  )
  .get(
    "/budgets/progress/:budgetId",
    async ({ user, params }) => {
      try {
        const { budgetUid } = params;

        const budget = await budgetService.findByUid(budgetUid);

        if (!budget) {
          return {
            error: true,
            message: "Budget not found",
            status: 404,
          };
        }

        // Ensure user owns this budget
        if (budget.userId !== user.id) {
          return {
            error: true,
            message: "Not authorized to view this budget",
            status: 403,
          };
        }

        const progress = await budgetService.getBudgetProgress({
          budgetUid: budgetUid,
        });

        return { data: BudgetProgressSchema.parse(progress) };
      } catch (error: any) {
        return {
          error: true,
          message: error.message || "Failed to get budget progress",
        };
      }
    },
    {
      auth: true,
      params: z.object({
        budgetUid: z.string(),
      }),
      response: {
        200: z.object({
          data: BudgetProgressSchema,
        }),
        404: z.object({
          error: z.boolean(),
          message: z.string(),
          status: z.number(),
        }),
        403: z.object({
          error: z.boolean(),
          message: z.string(),
          status: z.number(),
        }),
        500: z.object({
          error: z.boolean(),
          message: z.string(),
        }),
      },
    }
  )
  .post(
    "/budgets",
    async ({ user, body }) => {
      try {
        const budget = await budgetService.create(body, user.id);

        return { data: budget[0] };
      } catch (error: any) {
        return {
          error: true,
          message: error.message || "Failed to create budget",
        };
      }
    },
    {
      auth: true,
      body: CreateBudgetSchema,
      response: {
        200: z.object({
          data: BudgetOutputSchema,
        }),
        500: z.object({
          error: z.boolean(),
          message: z.string(),
        }),
      },
    }
  )
  .put(
    "/budgets/:uid",
    async ({ user, body, params }) => {
      try {
        const { uid } = params;

        // Check if budget exists and belongs to the user
        const existingBudget = await budgetService.findByUid(uid);

        if (!existingBudget) {
          return {
            error: true,
            message: "Budget not found",
            status: 404,
          };
        }

        if (existingBudget.userId !== user.id) {
          return {
            error: true,
            message: "Not authorized to update this budget",
            status: 403,
          };
        }

        const updatedBudget = await budgetService.updateByUid(uid, body);

        return { data: updatedBudget[0] };
      } catch (error: any) {
        return {
          error: true,
          message: error.message || "Failed to update budget",
        };
      }
    },
    {
      auth: true,
      params: z.object({
        uid: z.string(),
      }),
      body: UpdateBudgetSchema,
      response: {
        200: z.object({
          data: BudgetOutputSchema,
        }),
        404: z.object({
          error: z.boolean(),
          message: z.string(),
          status: z.number(),
        }),
        403: z.object({
          error: z.boolean(),
          message: z.string(),
          status: z.number(),
        }),
        500: z.object({
          error: z.boolean(),
          message: z.string(),
        }),
      },
    }
  )
  .delete(
    "/budgets/:uid",
    async ({ user, params }) => {
      try {
        const { uid } = params;

        // Check if budget exists and belongs to the user
        const existingBudget = await budgetService.findByUid(uid);

        if (!existingBudget) {
          return {
            error: true,
            message: "Budget not found",
            status: 404,
          };
        }

        if (existingBudget.userId !== user.id) {
          return {
            error: true,
            message: "Not authorized to delete this budget",
            status: 403,
          };
        }

        const result = await budgetService.removeByUid(uid);

        return { data: BudgetOutputSchema.parse(result[0]) };
      } catch (error: any) {
        return {
          error: true,
          message: error.message || "Failed to delete budget",
        };
      }
    },
    {
      auth: true,
      params: z.object({
        uid: z.string(),
      }),
      response: {
        200: z.object({
          data: BudgetOutputSchema,
        }),
        404: z.object({
          error: z.boolean(),
          message: z.string(),
          status: z.number(),
        }),
        403: z.object({
          error: z.boolean(),
          message: z.string(),
          status: z.number(),
        }),
        500: z.object({
          error: z.boolean(),
          message: z.string(),
        }),
      },
    }
  )
  .get(
    "/budgets/category/:categoryId",
    async ({ user, params }) => {
      try {
        const { categoryId } = params;

        const budgets = await budgetService.findByCategory(categoryId, user.id);

        return { data: z.array(BudgetOutputSchema).parse(budgets) };
      } catch (error: any) {
        return {
          error: true,
          message: error.message || "Failed to fetch budgets for category",
        };
      }
    },
    {
      auth: true,
      params: z.object({
        categoryId: z.string(),
      }),
      response: {
        200: z.object({
          data: z.array(BudgetOutputSchema),
        }),
        500: z.object({
          error: z.boolean(),
          message: z.string(),
        }),
      },
    }
  )
  .get(
    "/budgets/count",
    async ({ user }) => {
      try {
        const count = await budgetService.countByUserId(user.id);

        return { data: { count } };
      } catch (error: any) {
        return {
          error: true,
          message: error.message || "Failed to count budgets",
        };
      }
    },
    {
      auth: true,
      response: {
        200: z.object({
          data: z.object({
            count: z.number(),
          }),
        }),
        500: z.object({
          error: z.boolean(),
          message: z.string(),
        }),
      },
    }
  );
