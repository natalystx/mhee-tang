import type { transaction } from "@/db/schema/transaction";
import { z } from "zod";

export type TransactionInput = Omit<
  typeof transaction.$inferInsert,
  "id" | "createdAt" | "updatedAt" | "uid"
>;

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1).describe("Page number for pagination"),
  pageSize: z
    .number()
    .min(1)
    .max(100)
    .default(20)
    .describe("Number of items per page for pagination"),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

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

const uploadTransaction = z.object({
  image: z.instanceof(File).describe("Image file to be uploaded"),
});

export const UploadTransactionSchema = z
  .object({
    images: z.array(uploadTransaction),
  })
  .describe("Array of image files to be uploaded");

export type UploadTransactionInput = z.infer<typeof UploadTransactionSchema>;
