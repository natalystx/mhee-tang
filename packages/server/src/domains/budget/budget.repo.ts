import { budget } from "@/db/schema/budget";
import { db } from "@/db";
import { eq, and, count } from "drizzle-orm";
import { uid } from "@/utils/uid";
import { UID_PREFIX } from "@/constants/uid-prefix";
import type {
  BudgetInput,
  BudgetUpdateInput,
  FindByUserIdParams,
} from "./budget.type";

const create = async (data: BudgetInput) => {
  const existingByCategory = await db.query.budget.findFirst({
    where: and(
      eq(budget.categoryId, data.categoryId),
      eq(budget.userId, data.userId),
      eq(budget.isDeleted, false)
    ),
  });

  if (existingByCategory) {
    throw new Error("Budget for this category already exists");
  }

  return db
    .insert(budget)
    .values({ ...data, uid: uid(UID_PREFIX.BUDGET) })
    .returning();
};

const findByUid = (uid: string) => {
  return db.query.budget.findFirst({
    where: (budget, { eq, and }) =>
      and(eq(budget.uid, uid), eq(budget.isDeleted, false)),
    with: {
      category: true,
    },
  });
};

const findByUidWithDeleted = (uid: string) => {
  return db.query.budget.findFirst({
    where: (budget, { eq }) => eq(budget.uid, uid),
    with: {
      category: true,
    },
  });
};

const findManyByUserId = ({
  userId,
  includeDeleted = false,
  page = 1,
  pageSize = 20,
}: FindByUserIdParams) => {
  const offset = (page - 1) * pageSize;

  return db.query.budget.findMany({
    where: (budget, { eq, and }) =>
      includeDeleted
        ? eq(budget.userId, userId)
        : and(eq(budget.userId, userId), eq(budget.isDeleted, false)),
    limit: pageSize,
    offset: offset,
    with: {
      category: true,
    },
    orderBy: (budget, { desc }) => [desc(budget.createdAt)],
  });
};

const updateByUid = (uid: string, data: BudgetUpdateInput) => {
  return db
    .update(budget)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(budget.uid, uid))
    .returning();
};

const removeByUid = (uid: string) => {
  return db
    .update(budget)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(budget.uid, uid))
    .returning();
};

const hardRemoveByUid = (uid: string) => {
  return db.delete(budget).where(eq(budget.uid, uid)).returning();
};

const findByCategory = (categoryId: string, userId: string) => {
  return db.query.budget.findMany({
    where: (budget, { eq, and }) =>
      and(
        eq(budget.categoryId, categoryId),
        eq(budget.userId, userId),
        eq(budget.isDeleted, false)
      ),
    with: {
      category: true,
    },
  });
};

const countByUserId = async (userId: string) => {
  const result = await db
    .select({ count: count() })
    .from(budget)
    .where(and(eq(budget.userId, userId), eq(budget.isDeleted, false)));

  return result.length;
};

const updateCurrentAmount = async (
  categoryId: string,
  userId: string,
  amount: number,
  type: string
) => {
  // Only adjust budget if it's an expense transaction
  if (type !== "expense") {
    return null;
  }

  // Find the budget for this category and user
  const budgetForCategory = await db.query.budget.findFirst({
    where: (budget, { eq, and }) =>
      and(
        eq(budget.categoryId, categoryId),
        eq(budget.userId, userId),
        eq(budget.isDeleted, false)
      ),
  });

  if (!budgetForCategory) {
    return null; // No budget found for this category
  }

  // Add the expense amount to the current amount
  const currentAmount = parseFloat(
    budgetForCategory.currentAmount?.toString() || "0"
  );
  const newAmount = (currentAmount + amount).toString();

  // Update the budget
  const updatedBudget = await db
    .update(budget)
    .set({
      currentAmount: newAmount,
      updatedAt: new Date(),
    })
    .where(eq(budget.uid, budgetForCategory.uid))
    .returning();

  return updatedBudget[0];
};

export const budgetRepo = {
  create,
  findByUid,
  findByUidWithDeleted,
  findManyByUserId,
  updateByUid,
  removeByUid,
  hardRemoveByUid,
  findByCategory,
  countByUserId,
  updateCurrentAmount,
};
