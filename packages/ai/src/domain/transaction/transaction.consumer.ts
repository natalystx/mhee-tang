import { transactionExtractQueue } from "@mhee-tang/queue";
import { transactionService } from "./transaction.service";

const consume = () => {
  return transactionExtractQueue.consumer(async (data) => {
    console.log("Received transaction extract job:");
    const result = await transactionService.storeTransactions(data);
    await transactionService.parseTransactions(result.userId, result.batchId);
  });
};

export const transactionConsumer = {
  consume,
};
