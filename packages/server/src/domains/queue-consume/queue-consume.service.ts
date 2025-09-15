import { transactionConsumer } from "../transaction/transaction.consumer";

const init = async () => {
  // Initialize other consumers if needed
  await transactionConsumer.consume();
};

export const queueConsumeService = {
  init,
};
