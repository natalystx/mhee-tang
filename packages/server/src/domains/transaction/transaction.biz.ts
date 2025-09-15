import { db } from "@/db";
import { transactionRepo } from "./transaction.repo";
import type { PaginationInput, TransactionInput } from "./transaction.type";

const create = (data: TransactionInput) => {
  return db.transaction(async () => {
    return await transactionRepo.create(data);
  });
};

const findManyByUserId = (
  userId: string,
  pagination: PaginationInput,
  descending = true
) => {
  return transactionRepo.findManyByUserId(userId, pagination, descending);
};

const findByUid = (uid: string) => {
  return transactionRepo.findByUid(uid);
};

const updateByUid = (uid: string, data: Partial<TransactionInput>) => {
  return transactionRepo.updateByUid(uid, data);
};

const removeByUid = (uid: string) => {
  return transactionRepo.removeByUid(uid);
};

const hardRemoveByUid = (uid: string) => {
  return transactionRepo.hardRemoveByUid(uid);
};

const getByCategoryId = (
  categoryId: string,
  userId: string,
  descending = true
) => {
  return transactionRepo.getByCategoryId(categoryId, userId, descending);
};

const getByTagIds = (tagsId: string[], userId: string, descending: boolean) => {
  return transactionRepo.getByTagIds(tagsId, userId, descending);
};

export const transactionBiz = {
  create,
  findByUid,
  findManyByUserId,
  updateByUid,
  removeByUid,
  hardRemoveByUid,
  getByCategoryId,
  getByTagIds,
};
