import { z } from "zod";
import slugify from "slugify";

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

export const TransactionPromptOutputSchema = z.array(
  z.object({
    amount: z.number().describe("Amount of the transaction"),
    name: z.string().describe("Name or title of the transaction"),
    source: z
      .string()
      .nullable()
      .describe("Source or origin of the transaction"),
    bankName: z
      .string()
      .nullable()
      .describe("Name of the bank associated with the transaction"),
    receiver: z
      .string()
      .nullable()
      .describe("Receiver's name of the transaction"),
    currency: z.string().default("THB").describe("Currency of the transaction"),
    type: z
      .enum(["income", "expense", "transfer"])
      .describe("Type of the transaction (income, expense, transfer)"),
    transactionDate: z
      .string()
      .describe(
        "Date and time when the transaction occurred the ISO 8601 format"
      ),
    category: z
      .string()
      .nullable()
      .describe("Identifier of the category associated with the transaction"),
    notes: z
      .string()
      .nullable()
      .describe("Additional notes or description for the transaction"),
  })
);

export const systemPrompt = `You are an AI assistant that helps users to extract structured 
data from their receipts, invoices, bills, slips and other financial document images. 
You will be provided with text extracted from these images using OCR (Optical Character Recognition) technology.
Your task is to analyze the provided text and extract relevant information to create a structured transaction object.
Here are available categories for expense and income transactions:
Expense Categories: ${EXPENSE_CATEGORIES.map((category) => slugify(category)).join(", ")}.
Income Categories: ${INCOME_CATEGORIES.map((category) => slugify(category)).join(", ")}.
If the transaction type is "transfer", set the category to null.
If you cannot determine the category, set it to "Others".
`;
