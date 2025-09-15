import { transactionService } from "./transaction.service";

const consume = async () => {
  transactionService.onTransactionExtractCompleted();
};

export const transactionConsumer = {
  consume,
};
