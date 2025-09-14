import { z } from "zod";

const imageSchema = z.object({
  name: z.string(),
  content: z.base64(),
  mimeType: z.string(),
});

export const transactionExtractorPayloadSchema = z.object({
  images: z.array(imageSchema).min(1),
  userId: z.string().min(1),
});

export type TransactionExtractorPayload = z.infer<
  typeof transactionExtractorPayloadSchema
>;

const transactionSchema = z.object({
  date: z.string().min(1),
  amount: z.number(),
  description: z.string().min(1),
  type: z.enum(["expense", "income", "transfer"]),
  category: z.string().min(1).optional(),
});

const transactionExtractorResultSchema = z.object({
  transactions: z.array(transactionSchema).min(1),
  userId: z.string().min(1),
});

export type TransactionExtractorResult = z.infer<
  typeof transactionExtractorResultSchema
>;

export const transactionExtractorQueue = {
  name: "transaction-extractor",
  payloadSchema: transactionExtractorPayloadSchema,
};

export const transactionExtractorResultQueue = {
  name: "transaction-extractor-result",
  payloadSchema: transactionExtractorResultSchema,
};
