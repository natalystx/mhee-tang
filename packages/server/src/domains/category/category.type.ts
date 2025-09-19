import { z } from "zod";
import { transactionTypeEnum } from "@/db/schema/transaction";

export const CategorySchema = z.object({
  uid: z.string().optional(),
  name: z.string(),
  type: z.enum([
    transactionTypeEnum.enumValues[0],
    transactionTypeEnum.enumValues[1],
    transactionTypeEnum.enumValues[2],
  ]),
  slug: z.string().optional(),
  userId: z.string().optional(),
});

export type Category = z.infer<typeof CategorySchema>;
export type CategoryInput = Omit<Category, "uid">;

export const CategoryResponseSchema = CategorySchema;
export const CategoryArraySchema = z.array(CategoryResponseSchema);

export const CategoryTypeQuerySchema = z.object({
  type: z.enum([
    transactionTypeEnum.enumValues[0],
    transactionTypeEnum.enumValues[1],
    transactionTypeEnum.enumValues[2],
  ]),
});
