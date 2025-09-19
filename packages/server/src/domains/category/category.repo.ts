import { db } from "@/db";
import { eq, isNull } from "drizzle-orm";
import { category } from "@/db/schema/transaction";
import { uid } from "@/utils/uid";
import { UID_PREFIX } from "@/constants/uid-prefix";

export const categoryRepo = {
  create: async (data: typeof category.$inferInsert) => {
    const [result] = await db
      .insert(category)
      .values({
        ...data,
        uid: uid(UID_PREFIX.CATEGORY),
      })
      .returning();
    return result;
  },

  update: async (uid: string, data: Partial<typeof category.$inferInsert>) => {
    const [result] = await db
      .update(category)
      .set({ ...data })
      .where(eq(category.uid, uid))
      .returning();
    return result;
  },

  remove: async (uid: string) => {
    const [result] = await db
      .delete(category)
      .where(eq(category.uid, uid))
      .returning();
    return result;
  },

  getByUid: async (uid: string) => {
    const result = await db.query.category.findFirst({
      where: eq(category.uid, uid),
    });
    return result;
  },

  getAllByUserId: async (userId: string) => {
    const results = await db.query.category.findMany({
      where: eq(category.userId, userId),
    });
    return results;
  },

  getAllDefaultCategories: async () => {
    const results = await db.query.category.findMany({
      where: isNull(category.userId),
    });
    return results;
  },

  getAllCategoriesByType: async (
    type: typeof category.$inferInsert.type,
    userId?: string
  ) => {
    if (userId) {
      const userCategories = await db.query.category.findMany({
        where: (fields, { eq, and }) =>
          and(eq(fields.type, type), eq(fields.userId, userId)),
      });

      const defaultCategories = await db.query.category.findMany({
        where: (fields, { eq, and, isNull }) =>
          and(eq(fields.type, type), isNull(fields.userId)),
      });

      return [...userCategories, ...defaultCategories];
    } else {
      return await db.query.category.findMany({
        where: (fields, { eq, isNull }) => eq(fields.type, type),
      });
    }
  },
};
