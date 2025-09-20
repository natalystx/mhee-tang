import { budgetRepo } from "./budget.repo";
import { db } from "@/db";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  isBefore,
  parseISO,
  differenceInDays,
} from "date-fns";

import type {
  BudgetInput,
  BudgetUpdateInput,
  FindByUserIdParams,
  BudgetProgress,
  GetBudgetProgressInput,
  CreateBudgetInput,
  UpdateBudgetInput,
  UpdateBudgetAmountInput,
  UpdateCategoryIdInput,
} from "./budget.type";

const create = async (
  data: CreateBudgetInput,
  userId: string
): Promise<any> => {
  const budgetData: BudgetInput = {
    ...data,
    userId,
    startDate: parseISO(data.startDate),
    endDate: data.endDate ? parseISO(data.endDate) : undefined,
  };

  // For custom cycle, endDate is required
  if (data.cycle === "custom" && !data.endDate) {
    throw new Error("End date is required for custom cycle budgets");
  }

  return budgetRepo.create(budgetData);
};

const findByUid = (uid: string) => {
  return budgetRepo.findByUid(uid);
};

const findByUidWithDeleted = (uid: string) => {
  return budgetRepo.findByUidWithDeleted(uid);
};

const findManyByUserId = (params: FindByUserIdParams) => {
  return budgetRepo.findManyByUserId(params);
};

const updateByUid = async (
  uid: string,
  data: UpdateBudgetInput
): Promise<any> => {
  const budgetData: BudgetUpdateInput = {
    ...data,
    startDate: data.startDate ? parseISO(data.startDate) : undefined,
    endDate: data.endDate ? parseISO(data.endDate) : undefined,
  };

  // For custom cycle, endDate is required
  if (data.cycle === "custom" && !data.endDate) {
    throw new Error("End date is required for custom cycle budgets");
  }

  return budgetRepo.updateByUid(uid, budgetData);
};

const removeByUid = (uid: string) => {
  return budgetRepo.removeByUid(uid);
};

const hardRemoveByUid = (uid: string) => {
  return budgetRepo.hardRemoveByUid(uid);
};

const findByCategory = (categoryId: string, userId: string) => {
  return budgetRepo.findByCategory(categoryId, userId);
};

const getBudgetProgress = async ({
  budgetUid,
}: GetBudgetProgressInput): Promise<BudgetProgress> => {
  // Get the budget with its category
  const budgetWithCategory = await budgetRepo.findByUid(budgetUid);

  if (!budgetWithCategory) {
    throw new Error(`Budget with uid ${budgetUid} not found`);
  }

  const budget = budgetWithCategory;
  const now = new Date();
  const startDate = new Date(budget.startDate);
  let endDate: Date;

  // Calculate end date based on budget cycle
  switch (budget.cycle) {
    case "daily":
      endDate = addDays(startDate, 1);
      break;
    case "weekly":
      endDate = addWeeks(startDate, 1);
      break;
    case "monthly":
      endDate = addMonths(startDate, 1);
      break;
    case "yearly":
      endDate = addYears(startDate, 1);
      break;
    case "custom":
      endDate = budget.endDate
        ? new Date(budget.endDate)
        : addMonths(startDate, 1);
      break;
    default:
      endDate = addMonths(startDate, 1);
  }

  // Calculate spent amount for this budget from transactions
  // We need to get all transactions for the category within the date range
  const categoryId = budget.categoryId;
  let transactionAmount = "0";

  if (categoryId) {
    // Get all transactions for this category within the budget period
    const transactions = await db.query.transaction.findMany({
      where: (t, { eq, and, gte, lte }) =>
        and(
          eq(t.categoryId, categoryId),
          eq(t.userId, budget.userId),
          eq(t.isDeleted, false),
          gte(t.transactionDate, startDate),
          lte(t.transactionDate, isBefore(now, endDate) ? now : endDate)
        ),
    });

    // Sum up the transaction amounts (for expense type)
    if (transactions.length > 0) {
      const totalAmount = transactions.reduce((sum, txn) => {
        if (txn.type === "expense") {
          return sum + parseFloat(txn.amount.toString());
        }
        return sum;
      }, 0);

      transactionAmount = totalAmount.toString();
    }
  }

  const currentAmount = transactionAmount;
  const target = budget.target.toString();
  const percentage = Math.min(
    100,
    Math.round((parseFloat(currentAmount) / parseFloat(target)) * 100)
  );

  // Calculate remaining days in the budget cycle
  const remainingDays = isBefore(now, endDate)
    ? differenceInDays(endDate, now)
    : 0;

  return {
    uid: budget.uid,
    name: budget.name,
    currentAmount,
    target,
    percentage,
    startDate: budget.startDate.toISOString(),
    endDate: budget.endDate?.toISOString(),
    cycle: budget.cycle,
    categoryName: budget.category?.name,
    remainingDays,
  };
};

const countByUserId = (userId: string) => {
  return budgetRepo.countByUserId(userId);
};

const updateCurrentAmount = async (data: UpdateBudgetAmountInput) => {
  if (!data.categoryId) return null;

  // First check if a budget exists with this category for the user
  const budget = await budgetRepo.findByCategory(data.categoryId, data.userId);
  if (!budget) return null;

  return budgetRepo.updateCurrentAmount(
    data.categoryId,
    data.userId,
    data.amount,
    data.type
  );
};

const updateCategoryId = async ({
  budgetUid,
  newCategoryId,
  migrateCurrentAmountOption = "do_nothing",
}: UpdateCategoryIdInput) => {
  // Get the existing budget
  const existing = await budgetRepo.findByUid(budgetUid);
  if (!existing) throw new Error("Budget not found");

  // Prepare update data
  const updateData: BudgetUpdateInput = {
    categoryId: newCategoryId,
  };

  // Handle the current amount based on the migration option
  switch (migrateCurrentAmountOption) {
    case "reset_to_zero":
      // Reset the current amount to zero
      updateData.currentAmount = "0";
      break;

    case "new_category_data":
      // Calculate the current amount based on transactions for the new category
      if (newCategoryId) {
        const now = new Date();
        const startDate = new Date(existing.startDate);
        let endDate: Date;

        // Calculate end date based on budget cycle
        switch (existing.cycle) {
          case "daily":
            endDate = addDays(startDate, 1);
            break;
          case "weekly":
            endDate = addWeeks(startDate, 1);
            break;
          case "monthly":
            endDate = addMonths(startDate, 1);
            break;
          case "yearly":
            endDate = addYears(startDate, 1);
            break;
          case "custom":
            endDate = existing.endDate
              ? new Date(existing.endDate)
              : addMonths(startDate, 1);
            break;
          default:
            endDate = addMonths(startDate, 1);
        }

        const transactions = await db.query.transaction.findMany({
          where: (t, { eq, and, gte, lte }) =>
            and(
              eq(t.categoryId, newCategoryId),
              eq(t.userId, existing.userId),
              eq(t.isDeleted, false),
              eq(t.type, "expense"),
              gte(t.transactionDate, startDate),
              lte(t.transactionDate, isBefore(now, endDate) ? now : endDate)
            ),
        });

        if (transactions.length > 0) {
          const totalAmount = transactions.reduce(
            (sum, txn) => sum + parseFloat(txn.amount.toString()),
            0
          );
          updateData.currentAmount = totalAmount.toString();
        } else {
          updateData.currentAmount = "0";
        }
      }
      break;

    case "do_nothing":
    default:
      // Keep the current amount as is
      break;
  }

  // Update the budget
  return budgetRepo.updateByUid(budgetUid, updateData);
};

export const budgetBiz = {
  create,
  findByUid,
  findByUidWithDeleted,
  findManyByUserId,
  updateByUid,
  removeByUid,
  hardRemoveByUid,
  findByCategory,
  getBudgetProgress,
  countByUserId,
  updateCurrentAmount,
  updateCategoryId,
};
