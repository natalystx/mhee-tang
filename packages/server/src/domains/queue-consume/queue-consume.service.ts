import { transactionQueue } from "../transaction/transaction.queue";

const init = async () => {
  // Initialize other consumers if needed
  await transactionQueue.onTransactionExtractCompleted();
};

export const queueConsumeService = {
  init,
};
