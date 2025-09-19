import { uid } from "@/utils/uid";
import { category, transactionTypeEnum } from "../schema/transaction";
import slugify from "slugify";
import { UID_PREFIX } from "@/constants/uid-prefix";

const EXPENSE_CATEGORIES = [
  "Food & Drink",
  "Transportation",
  "Shopping",
  "Health",
  "Entertainment",
  "Bills & Utilities",
  "Education",
  "Personal Care",
  "Travel",
  "Gifts & Donations",
  "Others",
];

const INCOME_CATEGORIES = ["Salary", "Business/Freelance", "Other Income"];

export const categories: (typeof category.$inferInsert)[] = [
  ...(EXPENSE_CATEGORIES.map((name) => ({
    name,
    type: "expense",
    uid: uid(UID_PREFIX.CATEGORY),
    slug: slugify(name, { lower: true }),
  })) as (typeof category.$inferInsert)[]),
  ...(INCOME_CATEGORIES.map((name) => ({
    name,
    type: "income",
    uid: uid(UID_PREFIX.CATEGORY),
    slug: slugify(name, { lower: true }),
  })) as (typeof category.$inferInsert)[]),
];
