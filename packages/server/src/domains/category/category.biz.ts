import { categoryRepo } from "./category.repo";
import type { CategoryInput } from "./category.type";
import slugify from "slugify";

export const categoryBiz = {
  create: async (input: CategoryInput) => {
    // Create slug from category name
    const slug = slugify(input.name, { lower: true });

    const category = await categoryRepo.create({
      ...input,
      slug,
    });

    return category;
  },

  update: async (uid: string, input: Partial<CategoryInput>) => {
    // If name is updated, update the slug as well
    const updates: Partial<CategoryInput> = { ...input };

    if (input.name) {
      updates.slug = slugify(input.name, { lower: true });
    }

    const category = await categoryRepo.update(uid, updates);
    return category;
  },

  remove: async (uid: string) => {
    return categoryRepo.remove(uid);
  },

  getByUid: async (uid: string) => {
    return categoryRepo.getByUid(uid);
  },

  getAllByUserId: async (userId: string) => {
    return categoryRepo.getAllByUserId(userId);
  },

  getAllDefaultCategories: async () => {
    return categoryRepo.getAllDefaultCategories();
  },

  getAllCategories: async (userId: string) => {
    const userCategories = await categoryRepo.getAllByUserId(userId);
    const defaultCategories = await categoryRepo.getAllDefaultCategories();

    return [...userCategories, ...defaultCategories];
  },

  getAllCategoriesByType: async (
    type: "income" | "expense" | "transfer",
    userId?: string
  ) => {
    return categoryRepo.getAllCategoriesByType(type, userId);
  },
};
