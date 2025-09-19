import { categoryBiz } from "./category.biz";
import type { CategoryInput } from "./category.type";

export const categoryService = {
  create: async (input: CategoryInput) => {
    return categoryBiz.create(input);
  },

  update: async (uid: string, input: Partial<CategoryInput>) => {
    return categoryBiz.update(uid, input);
  },

  remove: async (uid: string) => {
    return categoryBiz.remove(uid);
  },

  getByUid: async (uid: string) => {
    return categoryBiz.getByUid(uid);
  },

  getAllByUserId: async (userId: string) => {
    return categoryBiz.getAllByUserId(userId);
  },

  getAllDefaultCategories: async () => {
    return categoryBiz.getAllDefaultCategories();
  },

  getAllCategories: async (userId: string) => {
    return categoryBiz.getAllCategories(userId);
  },

  getAllCategoriesByType: async (
    type: "income" | "expense" | "transfer",
    userId?: string
  ) => {
    return categoryBiz.getAllCategoriesByType(type, userId);
  },
};
