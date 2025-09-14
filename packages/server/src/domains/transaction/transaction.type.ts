import type { transaction } from "@/db/schema/transaction";
import { z } from "zod";

export type TransactionInput = Omit<
  typeof transaction.$inferInsert,
  "id" | "createdAt" | "updatedAt" | "uid"
>;

export const TransactionSchema = z.object({
  uid: z.string().describe("Unique identifier for the transaction"),
  name: z.string().describe("Name or title of the transaction"),
  amount: z.string().describe("Amount of the transaction"),
  currency: z
    .string()
    .default("THB")
    .nullable()
    .describe("Currency of the transaction"),
  type: z
    .enum(["income", "expense", "transfer"])
    .describe("Type of the transaction (income, expense, transfer)"),
  onDeviceImageURI: z
    .string()
    .nullable()
    .describe("URI of the image stored on the device"),
  notes: z
    .string()
    .nullable()
    .describe("Additional notes or description for the transaction"),
  transactionDate: z
    .string()
    .describe(
      "Date and time when the transaction occurred the ISO 8601 format"
    ),
  isDeleted: z
    .boolean()
    .default(false)
    .describe("Indicates if the transaction is deleted"),
  userId: z
    .string()
    .describe("Identifier of the user who owns the transaction"),
  categoryId: z
    .string()
    .nullable()
    .describe("Identifier of the category associated with the transaction"),
});

export const TransactionArraySchema = z.array(TransactionSchema);

export const toTransaction = (data: typeof transaction.$inferSelect) => {
  return TransactionSchema.parse(data);
};

export const toTransactionArray = (
  data: (typeof transaction.$inferSelect)[]
) => {
  return data.map(toTransaction);
};
