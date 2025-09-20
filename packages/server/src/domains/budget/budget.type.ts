import { z } from "zod";
import { budget } from "@/db/schema/budget";
import { CategorySchema } from "../transaction/transaction.type";

export type BudgetInput = Omit<
  typeof budget.$inferInsert,
  "id" | "createdAt" | "updatedAt" | "currentAmount"
>;

// Allow currentAmount to be included in updates
export type BudgetUpdateInput = Partial<BudgetInput> & {
  currentAmount?: string;
};

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1).describe("Page number for pagination"),
  pageSize: z
    .number()
    .min(1)
    .max(100)
    .default(20)
    .describe("Number of items per page for pagination"),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

/**
 * Input type for updating a budget's current amount
 */
export interface UpdateBudgetAmountInput {
  /** Category ID to identify the budget */
  categoryId: string;
  /** User ID to ensure only the user's budgets are updated */
  userId: string;
  /** Transaction amount as a number */
  amount: number;
  /** Transaction type (only 'expense' affects budgets) */
  type: string;
}

export const BudgetSchema = z.object({
  uid: z.string().describe("Unique identifier for the budget"),
  name: z.string().describe("Name or title of the budget"),
  currentAmount: z
    .string()
    .default("0")
    .describe("Current amount accumulated in the budget"),
  target: z.string().describe("Target amount for the budget"),
  cycle: z
    .enum(["daily", "weekly", "monthly", "yearly", "custom"])
    .describe(
      "Cycle period for the budget (daily, weekly, monthly, yearly, custom)"
    ),
  startDate: z.string().describe("Start date for the budget cycle"),
  endDate: z.string().optional().describe("End date for custom cycle budget"),
  resetOnLastBusinessDay: z
    .boolean()
    .default(false)
    .describe(
      "Whether to reset on the last business day (for monthly/yearly cycles)"
    ),
  categoryId: z.string().optional().describe("Associated category ID, if any"),
  createdAt: z.string().describe("When the budget was created"),
  updatedAt: z.string().describe("When the budget was last updated"),
});

export const CreateBudgetSchema = z.object({
  name: z.string().min(1).max(100).describe("Name or title of the budget"),
  target: z
    .string()
    .min(1)
    .describe("Target amount for the budget, as a decimal string"),
  cycle: z
    .enum(["daily", "weekly", "monthly", "yearly", "custom"])
    .describe("Cycle period for the budget"),
  startDate: z
    .string()
    .describe("Start date for the budget cycle in ISO format"),
  endDate: z
    .string()
    .optional()
    .describe("End date for custom cycle budget in ISO format"),
  resetOnLastBusinessDay: z
    .boolean()
    .default(false)
    .describe("Whether to reset on the last business day"),
  categoryId: z.string().describe("Associated category ID for the budget"),
});

export type CreateBudgetInput = z.infer<typeof CreateBudgetSchema>;

export const UpdateBudgetSchema = CreateBudgetSchema.partial();

export type UpdateBudgetInput = z.infer<typeof UpdateBudgetSchema>;

export type FindByUserIdParams = {
  userId: string;
  includeDeleted?: boolean;
} & PaginationInput;

export const GetBudgetProgressSchema = z.object({
  budgetUid: z.string().describe("Budget UID to get progress for"),
});

export type GetBudgetProgressInput = z.infer<typeof GetBudgetProgressSchema>;

export const BudgetProgressSchema = z.object({
  uid: z.string().describe("Unique identifier for the budget"),
  name: z.string().describe("Name or title of the budget"),
  currentAmount: z
    .string()
    .describe("Current amount accumulated in the budget"),
  target: z.string().describe("Target amount for the budget"),
  percentage: z
    .number()
    .describe("Percentage of the target amount that has been reached"),
  startDate: z.string().describe("Start date for the budget cycle"),
  endDate: z.string().optional().describe("End date for custom cycle budget"),
  cycle: z
    .enum(["daily", "weekly", "monthly", "yearly", "custom"])
    .describe(
      "Cycle period for the budget (daily, weekly, monthly, yearly, custom)"
    ),
  categoryName: z
    .string()
    .optional()
    .describe("Associated category name, if any"),
  remainingDays: z
    .number()
    .optional()
    .describe("Number of days remaining in the current budget cycle"),
});

export type BudgetProgress = z.infer<typeof BudgetProgressSchema>;

export const BudgetOutputSchema = BudgetSchema.omit({
  categoryId: true,
}).extend(CategorySchema);

export type BudgetOutput = z.infer<typeof BudgetOutputSchema>;

export const UpdateCategoryIdSchema = z.object({
  budgetUid: z.string().describe("Unique identifier for the budget"),
  newCategoryId: z
    .string()
    .describe("New category ID to associate with the budget"),
  migrateCurrentAmountOption: z
    .enum(["new_category_data", "reset_to_zero", "do_nothing"])
    .optional()
    .default("do_nothing")
    .describe("Option for handling current amount when changing category"),
});

export type UpdateCategoryIdInput = z.infer<typeof UpdateCategoryIdSchema>;
