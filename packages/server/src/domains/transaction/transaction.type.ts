import { category, type transaction } from "@/db/schema/transaction";
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

const CategorySchema = z.object({
  uid: z.string().describe("Unique identifier for the category"),
  name: z.string().describe("Name of the category"),
  slug: z.string().describe("Slug for the category"),
  userId: z
    .string()
    .nullable()
    .describe(
      "Identifier of the user who owns the category if null it's a default category"
    ),
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
  transactionDate: z.coerce
    .date()
    .transform((date) => date.toISOString())
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
  category: CategorySchema.nullable().describe("Category of the transaction"),
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
  image: z.base64().describe("Base64 encoded image file"),
});

export const UploadTransactionSchema = z
  .object({
    images: z.array(uploadTransaction),
  })
  .describe("Array of image files to be uploaded");

export const AggregateByMonthSchema = z.object({
  dateISO: z
    .string()
    .describe("ISO 8601 formatted date to specify the month and year"),
  type: z
    .enum(["income", "expense", "transfer", "balance"])
    .describe(
      "Type of transactions to aggregate (income, expense, transfer, balance)"
    ),
  userId: z.string().describe("Identifier of the user"),
});

export type UploadTransactionInput = z.infer<typeof UploadTransactionSchema>;

export type FindByTagIdsParams = {
  tagsId: string[];
  userId: string;
  descending: boolean;
  startDate?: string;
  endDate?: string;
} & PaginationInput;

export type FindByCategoryIdsParams = {
  categoryIds: string[];
  userId: string;
  descending: boolean;
  startDate?: string;
  endDate?: string;
} & PaginationInput;

export type FindByDateRangeParams = {
  userId: string;
  startDateISO: string;
  endDateISO: string;
  descending?: boolean;
} & PaginationInput;

export type FindByUserIdParams = {
  userId: string;
  descending?: boolean;
} & PaginationInput;

export type AggregateByMonthParams = z.infer<typeof AggregateByMonthSchema>;
