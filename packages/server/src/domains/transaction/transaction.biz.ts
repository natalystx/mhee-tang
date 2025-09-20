import { db } from "@/db";
import { transactionRepo } from "./transaction.repo";
import type {
  AggregateByMonthParams,
  FindByCategoryIdsParams,
  FindByDateRangeParams,
  FindByTagIdsParams,
  FindByUserIdParams,
  TransactionInput,
} from "./transaction.type";
import { transactionQueue } from "./transaction.queue";

const create = (data: TransactionInput) => {
  return db.transaction(async () => {
    return await transactionRepo.create(data);
  });
};

const findManyByUserId = (params: FindByUserIdParams) => {
  return transactionRepo.findManyByUserId(params);
};

const findByUid = (uid: string) => {
  return transactionRepo.findByUid(uid);
};

const updateByUid = async (uid: string, data: Partial<TransactionInput>) => {
  const existing = await transactionRepo.findByUid(uid);
  if (!existing) {
    throw new Error("Transaction not found");
  }

  const updated = await transactionRepo.updateByUid(uid, data);
  if (data.categoryId && existing.categoryId !== data.categoryId) {
    if (existing.type === "expense") {
      // If the category is changed for an expense transaction, we need to update the budgets accordingly
      transactionQueue.onUpdatedTransaction.next({
        userId: existing.userId,
        categoryId: existing.categoryId!,
        // use the existing amount to subtract from the old category budget
        amount: Number(existing.amount),
        uid: existing.uid!,
        actionType: "subtract",
      });

      // Add to the new category
      transactionQueue.onUpdatedTransaction.next({
        userId: existing.userId,
        categoryId: data.categoryId,
        amount: Number(data.amount),
        uid: existing.uid!,
        actionType: "add",
      });
    }
  }

  return updated;
};

const removeByUid = (uid: string) => {
  return transactionRepo.removeByUid(uid);
};

const hardRemoveByUid = (uid: string) => {
  return transactionRepo.hardRemoveByUid(uid);
};

const getByCategoryIds = (params: FindByCategoryIdsParams) => {
  return transactionRepo.findByCategoryIds(params);
};

const getByTagIds = (params: FindByTagIdsParams) => {
  return transactionRepo.findByTagIds(params);
};

const findAllByDateRange = (params: FindByDateRangeParams) => {
  return transactionRepo.findAllByDateRange(params);
};

const getAggregateByMonth = async (params: AggregateByMonthParams) => {
  return transactionRepo.aggregateByMonth(params);
};

export const transactionBiz = {
  create,
  findByUid,
  findManyByUserId,
  updateByUid,
  removeByUid,
  hardRemoveByUid,
  getByCategoryIds,
  getByTagIds,
  findAllByDateRange,
  getAggregateByMonth,
};
