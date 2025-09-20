import { eventPublisher } from "@/utils/publisher";
import { transactionService } from "./transaction.service";
import { z } from "zod";

const onTransactionExtractCompleted = async () => {
  transactionService.onTransactionExtractCompleted();
};

const OnUpdatedTransactionPayload = z.object({
  uid: z.string(),
  userId: z.string(),
  amount: z.number(),
  categoryId: z.string().optional(),
  actionType: z.enum(["add", "subtract"]).default("add"),
});

const { next, listen } = eventPublisher.createChannel(
  "transaction-updated",
  OnUpdatedTransactionPayload
);

const onUpdatedTransaction = {
  next,
  listen,
};

export const transactionQueue = {
  onTransactionExtractCompleted,
  onUpdatedTransaction,
};
