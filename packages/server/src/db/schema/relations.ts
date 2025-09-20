// relations.ts - Centralized place to define relations that might cause circular dependencies
import { relations } from "drizzle-orm";
import { budget } from "./budget";
import { category } from "./transaction";

// Extend the category relations with budgets
export const extendedCategoryRelations = relations(category, ({ many }) => ({
  budgets: many(budget),
}));

// These relations are defined in their respective schema files
// This is just to document relationships between entities with circular dependencies
// CategoryRelations -> defined in transaction.ts
//   - transactions: many(transaction)
//
// BudgetRelations -> defined in budget.ts
//   - user: one(user)
//   - category: one(category)
