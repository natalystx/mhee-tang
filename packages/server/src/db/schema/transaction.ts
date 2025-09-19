import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  decimal,
  primaryKey,
  integer,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { uid } from "@/utils/uid";
import { UID_PREFIX } from "@/constants/uid-prefix";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
  "transfer",
]);

export const tag = pgTable("tag", {
  uid: text("uid").unique().default(uid(UID_PREFIX.TAG)),
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const category = pgTable("category", {
  uid: text("uid").unique().default(uid(UID_PREFIX.CATEGORY)),
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: transactionTypeEnum("type").notNull(),
  slug: text("slug").notNull(),
  userId: text("user_id").references(() => user.id),
});

export const transaction = pgTable("transaction", {
  id: serial("id").primaryKey(),
  uid: text("uid").unique().default(uid(UID_PREFIX.TRANSACTION)),
  amount: decimal("amount", { precision: 19, scale: 4 }).notNull(),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("THB"),
  type: transactionTypeEnum("type").notNull(),
  notes: text("notes"),
  source: text("source"),
  bankName: text("bank_name"),
  receiver: text("receiver"),
  transactionDate: timestamp("transaction_date").notNull(),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  onDeviceImageURI: text("on_device_image_uri"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  categoryId: text("category_id").references(() => category.uid),
});

export const transactionTag = pgTable(
  "transaction_tag",
  {
    transactionId: text("transaction_id")
      .notNull()
      .references(() => transaction.uid),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.uid),
  },
  (table) => [
    primaryKey({
      columns: [table.transactionId, table.tagId],
    }),
  ]
);

export const recurringTypeEnum = pgEnum("recurring_type", [
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "custom",
]);

export const recurringTransaction = pgTable("recurring_transaction", {
  id: serial("id").primaryKey(),
  uid: text("uid").unique().default(uid(UID_PREFIX.RECURRING_TRANSACTION)),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  amount: decimal("amount", { precision: 19, scale: 4 }).notNull(),
  name: text("name").notNull(),
  type: transactionTypeEnum("type").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => category.uid),
  notes: text("notes"),
  // this field is only used when recurringType is "custom", the unit is days
  customInterval: integer("custom_interval"),
  recurringType: recurringTypeEnum("recur_type").notNull(),
  dayOfWeek: text("day_of_week"),
  dayOfMonth: text("day_of_month"),
  startDate: timestamp("start_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  endDate: timestamp("end_date"),
});

// Define relations between tables
export const categoryRelations = relations(category, ({ many }) => ({
  transactions: many(transaction),
}));

export const transactionRelations = relations(transaction, ({ one, many }) => ({
  category: one(category, {
    fields: [transaction.categoryId],
    references: [category.uid],
  }),
  user: one(user, {
    fields: [transaction.userId],
    references: [user.id],
  }),
  transactionTags: many(transactionTag),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  transactionTags: many(transactionTag),
}));

export const transactionTagRelations = relations(transactionTag, ({ one }) => ({
  transaction: one(transaction, {
    fields: [transactionTag.transactionId],
    references: [transaction.uid],
  }),
  tag: one(tag, {
    fields: [transactionTag.tagId],
    references: [tag.uid],
  }),
}));
