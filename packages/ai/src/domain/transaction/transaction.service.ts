import { transactionBiz } from "./transaction.biz";
import { TransactionInput } from "./transaction.type";

export const transactionService = {
  ...transactionBiz,
};
