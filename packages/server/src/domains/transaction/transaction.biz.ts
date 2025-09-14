import { transactionRepo } from "./transaction.repo";
import type { TransactionInput } from "./transaction.type";

const create = (data: TransactionInput) => {
  return transactionRepo.create(data);
};

const findManyByUserId = (userId: string, descending = true) => {
  return transactionRepo.findManyByUserId(userId, descending);
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
