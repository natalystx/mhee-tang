import { db } from "..";
import { category } from "../schema/transaction";
import { categories } from "./category.seeder";

export const initializeCategories = async () => {
  try {
    const existingCategories = await db.query.category.findMany();
    if (existingCategories.length === 0) {
      await db.insert(category).values(categories);
    }
  } catch (error) {
    console.error("Error initializing categories:", error);
  }
};
