import { z } from "zod";

const imageSchema = z.object({
  name: z.string(),
  content: z.base64(),
  mimeType: z.string(),
  ext: z.string(),
});

export const transactionExtractorPayloadSchema = z.object({
  images: z.array(imageSchema).min(1),
  userId: z.string().min(1),
});

export type TransactionExtractorPayload = z.infer<
  typeof transactionExtractorPayloadSchema
>;

const transactionSchema = z.object({
  currency: z.string().min(1),
  name: z.string().min(1),
  source: z.string().min(1).nullable(),
  bankName: z.string().min(1).nullable(),
  receiver: z.string().min(1).nullable(),
  type: z.enum(["expense", "income", "transfer"]),
  notes: z.string().nullable(),
  transactionDate: z.string().min(1),
  amount: z.number(),
  category: z.string().min(1).nullable(),
});

const transactionExtractorResultSchema = z.object({
  transactions: z.array(transactionSchema).min(1),
  userId: z.string().min(1),
  batchId: z.string().min(1),
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
