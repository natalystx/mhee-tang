import { db } from "@/db";
import { transactionRepo } from "./transaction.repo";
import type {
  AggregateByMonthParams,
  FindByCategoryIdsParams,
  FindByDateRangeParams,
  FindByTagIdsParams,
  FindByUserIdParams,
  PaginationInput,
  TransactionInput,
} from "./transaction.type";

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

const updateByUid = (uid: string, data: Partial<TransactionInput>) => {
  return transactionRepo.updateByUid(uid, data);
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
