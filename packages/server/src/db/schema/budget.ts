import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  decimal,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { uid } from "@/utils/uid";
import { UID_PREFIX } from "@/constants/uid-prefix";
import { category } from "./transaction";

export const cycleEnum = pgEnum("budget_cycle", [
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "custom",
]);

export const budget = pgTable("budget", {
  id: serial("id").primaryKey(),
  uid: text("uid").unique().default(uid(UID_PREFIX.BUDGET)).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  currentAmount: decimal("current_amount", {
    precision: 19,
    scale: 4,
  }).default("0"),
  target: decimal("target", { precision: 19, scale: 4 }).notNull(),
  cycle: cycleEnum("cycle").notNull(),
  startDate: timestamp("start_date").notNull(),
  // For custom cycle
  endDate: timestamp("end_date"),
  /// --------------------------------
  // If true, reset the budget on the last business day of the cycle
  // this is only applicable for monthly and yearly cycles
  resetOnLastBusinessDay: boolean("reset_on_last_business_day")
    .default(false)
    .notNull(),
  /// --------------------------------
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  categoryId: text("category_id")
    .references(() => category.uid)
    .notNull(),
  nextResetCron: text("next_reset_cron"),
  nextReset: timestamp("next_reset"),
});

// Define relations for the budget table
export const budgetRelations = relations(budget, ({ one }) => ({
  user: one(user, {
    fields: [budget.userId],
    references: [user.id],
  }),
  category: one(category, {
    fields: [budget.categoryId],
    references: [category.uid],
  }),
}));
