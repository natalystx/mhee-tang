import { category, transaction, transactionTag } from "@/db/schema/transaction";
import { db } from "@/db";
import type {
  AggregateByMonthParams,
  FindByCategoryIdsParams,
  FindByDateRangeParams,
  FindByTagIdsParams,
  FindByUserIdParams,
  TransactionInput,
} from "./transaction.type";
import { eq, and } from "drizzle-orm";
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
    with: {
      category: true,
      transactionTags: {
        with: {
          tag: true,
        },
      },
    },
  });
};

const findManyByUserId = ({
  userId,
  descending,
  page = 1,
  pageSize = 20,
}: FindByUserIdParams) => {
  const offset = (page - 1) * pageSize;
  return db.query.transaction.findMany({
    where: (transaction, { eq, and }) =>
      and(eq(transaction.userId, userId), eq(transaction.isDeleted, false)),
    limit: pageSize,
    offset: offset,
    with: {
      category: true,
      transactionTags: {
        with: {
          tag: true,
        },
      },
    },
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

const findByCategoryIds = ({
  categoryIds,
  userId,
  descending,
  startDate,
  endDate,
  page = 1,
  pageSize = 20,
}: FindByCategoryIdsParams) => {
  const startDateParsed = startDate ? parseISO(startDate) : undefined;
  const endDateParsed = endDate ? parseISO(endDate) : undefined;
  return db.query.transaction.findMany({
    with: {
      category: true,
      transactionTags: {
        with: {
          tag: true,
        },
      },
    },
    where: (transaction, { eq, and, inArray, lte, gte }) => {
      const conditions = [
        inArray(transaction.categoryId, categoryIds),
        eq(transaction.isDeleted, false),
        eq(transaction.userId, userId),
      ];
      if (startDateParsed) {
        conditions.push(gte(transaction.transactionDate, startDateParsed));
      }
      if (endDateParsed) {
        conditions.push(lte(transaction.transactionDate, endDateParsed));
      }
      return and(...conditions);
    },
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: (transaction, { desc, asc }) => [
      descending
        ? desc(transaction.transactionDate)
        : asc(transaction.transactionDate),
    ],
  });
};

const findByTagIds = ({
  tagsId,
  userId,
  descending,
  startDate: startDateISO,
  endDate: endDateISO,
  page = 1,
  pageSize = 20,
}: FindByTagIdsParams) => {
  const startDate = startDateISO ? parseISO(startDateISO) : undefined;
  const endDate = endDateISO ? parseISO(endDateISO) : undefined;

  return db.query.transaction.findMany({
    with: {
      category: true,
      transactionTags: {
        with: {
          tag: true,
        },
      },
    },
    limit: pageSize,
    offset: (page - 1) * pageSize,
    where: (transaction, { eq, and, inArray, gte, lte }) => {
      const dateConditions = [];
      if (startDate) {
        dateConditions.push(gte(transaction.transactionDate, startDate));
      }
      if (endDate) {
        dateConditions.push(lte(transaction.transactionDate, endDate));
      }
      return and(
        eq(transaction.isDeleted, false),
        eq(transaction.userId, userId),
        inArray(transaction.uid, tagsId),
        ...dateConditions
      );
    },
    orderBy: (transaction, { desc, asc }) => [
      descending
        ? desc(transaction.transactionDate)
        : asc(transaction.transactionDate),
    ],
  });
};

const aggregateByMonth = async ({
  userId,
  dateISO,
  type,
}: AggregateByMonthParams) => {
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

  const aggregatedValues = rows.reduce(
    (acc, curr) => {
      if (curr.type === "income") {
        acc.totalIncome += Number(curr.amount);
      } else if (curr.type === "expense") {
        acc.totalExpense += Number(curr.amount);
      } else if (curr.type === "transfer") {
        acc.totalTransfer += Number(curr.amount);
      }
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, totalTransfer: 0 }
  );

  switch (type) {
    case "income":
      return aggregatedValues.totalIncome;
    case "expense":
      return aggregatedValues.totalExpense;
    case "transfer":
      return aggregatedValues.totalTransfer;
    default:
      // this is for "balance" type
      return aggregatedValues.totalIncome - aggregatedValues.totalExpense;
  }
};

const findAllByDateRange = ({
  userId,
  startDateISO,
  endDateISO,
  descending,
  page = 1,
  pageSize = 20,
}: FindByDateRangeParams) => {
  const startDate = parseISO(startDateISO);
  const endDate = parseISO(endDateISO);
  return db.query.transaction.findMany({
    with: {
      category: true,
      transactionTags: {
        with: {
          tag: true,
        },
      },
    },
    limit: pageSize,
    offset: (page - 1) * pageSize,
    where: (transaction, { eq, and, gte, lte }) =>
      and(
        eq(transaction.userId, userId),
        eq(transaction.isDeleted, false),
        gte(transaction.transactionDate, startDate),
        lte(transaction.transactionDate, endDate)
      ),
    orderBy: (transaction, { desc, asc }) => [
      descending
        ? desc(transaction.transactionDate)
        : asc(transaction.transactionDate),
    ],
  });
};

const linkCategoryToTransactions = async (
  categoryId: string,
  transactionId: string
) => {
  return db
    .update(transaction)
    .set({ categoryId: categoryId, updatedAt: new Date() })
    .where(eq(transaction.uid, transactionId))
    .returning();
};

const linkTagToTransactions = async (tagId: string, transactionId: string) => {
  return db
    .insert(transactionTag)
    .values({
      tagId,
      transactionId,
    })
    .onConflictDoNothing() // Prevents duplicate entries if the relationship already exists
    .returning();
};

const unlinkTagFromTransaction = async (
  tagId: string,
  transactionId: string
) => {
  return db
    .delete(transactionTag)
    .where(
      and(
        eq(transactionTag.tagId, tagId),
        eq(transactionTag.transactionId, transactionId)
      )
    )
    .returning();
};

export const transactionRepo = {
  create,
  findByUid,
  findManyByUserId,
  updateByUid,
  removeByUid,
  hardRemoveByUid,
  findByCategoryIds,
  findByTagIds,
  aggregateByMonth,
  findAllByDateRange,
  linkCategoryToTransactions,
  linkTagToTransactions,
  unlinkTagFromTransaction,
};
