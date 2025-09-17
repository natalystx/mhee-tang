import { transaction } from "@/db/schema/transaction";
import { db } from "@/db";
import type { PaginationInput, TransactionInput } from "./transaction.type";
import { eq } from "drizzle-orm";
import {} from "date-fns";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import { uid } from "@/utils/uid";
import { UID_PREFIX } from "@/constants/uid-prefix";

const create = (data: TransactionInput) => {
  return db
    .insert(transaction)
    .values({ ...data, uid: uid(UID_PREFIX.TRANSACTION) })
    .returning();
};

const findByUid = (uid: string) => {
  return db.query.transaction.findFirst({
    where: (transaction, { eq, and }) =>
      and(eq(transaction.uid, uid), eq(transaction.isDeleted, false)),
  });
};

const findManyByUserId = (
  userId: string,
  pagination: PaginationInput,
  descending: boolean
) => {
  const { page, pageSize } = pagination;
  const offset = (page - 1) * pageSize;
  return db.query.transaction.findMany({
    where: (transaction, { eq, and }) =>
      and(eq(transaction.userId, userId), eq(transaction.isDeleted, false)),
    limit: pageSize,
    offset: offset,
    orderBy: (transaction, { desc, asc }) => [
      descending
        ? desc(transaction.transactionDate)
        : asc(transaction.transactionDate),
    ],
  });
};

const updateByUid = (uid: string, data: Partial<TransactionInput>) => {
  return db
    .update(transaction)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(transaction.uid, uid))
    .returning();
};

const removeByUid = (uid: string) => {
  return db
    .update(transaction)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(transaction.uid, uid))
    .returning();
};

const hardRemoveByUid = (uid: string) => {
  return db.delete(transaction).where(eq(transaction.uid, uid)).returning();
};

const getByCategoryId = (
  categoryId: string,
  userId: string,
  descending: boolean
) => {
  return db.query.transaction.findMany({
    where: (transaction, { eq, and }) =>
      and(
        eq(transaction.categoryId, categoryId),
        eq(transaction.isDeleted, false),
        eq(transaction.userId, userId)
      ),
    orderBy: (transaction, { desc, asc }) => [
      descending
        ? desc(transaction.transactionDate)
        : asc(transaction.transactionDate),
    ],
  });
};

const getByTagIds = (tagsId: string[], userId: string, descending: boolean) => {
  return db.query.transaction.findMany({
    where: (transaction, { eq, and, inArray }) =>
      and(
        eq(transaction.isDeleted, false),
        eq(transaction.userId, userId),
        inArray(transaction.uid, tagsId)
      ),
    orderBy: (transaction, { desc, asc }) => [
      descending
        ? desc(transaction.transactionDate)
        : asc(transaction.transactionDate),
    ],
  });
};

const aggregateByMonth = async (userId: string, dateISO: string) => {
  const baseDate = parseISO(dateISO);
  const startDate = startOfMonth(baseDate);
  const endDate = endOfMonth(baseDate);

  const rows = await db.query.transaction.findMany({
    where: (transaction, { eq, and, gte, lte }) =>
      and(
        eq(transaction.userId, userId),
        eq(transaction.isDeleted, false),
        gte(transaction.transactionDate, startDate),
        lte(transaction.transactionDate, endDate)
      ),
  });

  return rows.reduce(
    (acc, curr) => {
      if (curr.type === "income") {
        acc.totalIncome += Number(curr.amount);
      } else if (curr.type === "expense") {
        acc.totalExpense += Number(curr.amount);
      }
      return acc;
    },
    { totalIncome: 0, totalExpense: 0 }
  );
};

const findAllByDateRange = (
  userId: string,
  startDateISO: string,
  endDateISO: string
) => {
  const startDate = parseISO(startDateISO);
  const endDate = parseISO(endDateISO);
  return db.query.transaction.findMany({
    where: (transaction, { eq, and, gte, lte }) =>
      and(
        eq(transaction.userId, userId),
        eq(transaction.isDeleted, false),
        gte(transaction.transactionDate, startDate),
        lte(transaction.transactionDate, endDate)
      ),
    orderBy: (transaction, { desc }) => [desc(transaction.transactionDate)],
  });
};

export const transactionRepo = {
  create,
  findByUid,
  findManyByUserId,
  updateByUid,
  removeByUid,
  hardRemoveByUid,
  getByCategoryId,
  getByTagIds,
  aggregateByMonth,
  findAllByDateRange,
};
