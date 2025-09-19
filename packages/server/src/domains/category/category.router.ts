import { Elysia, t } from "elysia";
import { categoryService } from "./category.service";
import { betterAuth } from "@/middlewares/auth.middleware";
import slugify from "slugify";

export const categoryRouter = new Elysia({ name: "category-router" })
  .use(betterAuth)
  .get(
    "/categories",
    async ({ user }) => {
      try {
        return await categoryService.getAllCategories(user.id);
      } catch (error) {
        return { message: "Failed to fetch categories" };
      }
    },
    {
      auth: true,
      response: {
        200: t.Array(t.Any()),
        500: t.Object({ message: t.String() }),
      },
    }
  )
  .get(
    "/categories/default",
    async () => {
      try {
        return await categoryService.getAllDefaultCategories();
      } catch (error) {
        return { message: "Failed to fetch default categories" };
      }
    },
    {
      auth: true,
      response: {
        200: t.Array(t.Any()),
        500: t.Object({ message: t.String() }),
      },
    }
  )
  .get(
    "/categories/type/:type",
    async ({ params, user }) => {
      try {
        return await categoryService.getAllCategoriesByType(
          params.type as "income" | "expense" | "transfer",
          user.id
        );
      } catch (error) {
        return { message: "Failed to fetch categories by type" };
      }
    },
    {
      auth: true,
      params: t.Object({
        type: t.Union([
          t.Literal("income"),
          t.Literal("expense"),
          t.Literal("transfer"),
        ]),
      }),
      response: {
        200: t.Array(t.Any()),
        500: t.Object({ message: t.String() }),
      },
    }
  )
  .post(
    "/categories",
    async ({ body, user }) => {
      try {
        return await categoryService.create({
          name: body.name,
          type: body.type,
          userId: user.id,
          slug: slugify(body.name, { lower: true }),
        });
      } catch (error) {
        return { message: "Failed to create category" };
      }
    },
    {
      auth: true,
      body: t.Object({
        name: t.String(),
        type: t.Union([
          t.Literal("income"),
          t.Literal("expense"),
          t.Literal("transfer"),
        ]),
      }),
      response: {
        200: t.Any(),
        500: t.Object({ message: t.String() }),
      },
    }
  )
  .get(
    "/categories/:id",
    async ({ params, user }) => {
      try {
        const category = await categoryService.getByUid(params.id);

        // Allow access to default categories (userId is null) or user's own categories
        if (!category) {
          return { message: "Category not found" };
        }

        if (category.userId && category.userId !== user.id) {
          return {
            message: "You don't have permission to access this category",
          };
        }

        return category;
      } catch (error) {
        return { message: "Failed to fetch category" };
      }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Any(),
        404: t.Object({ message: t.String() }),
        403: t.Object({ message: t.String() }),
        500: t.Object({ message: t.String() }),
      },
    }
  )
  .put(
    "/categories/:id",
    async ({ params, body, user }) => {
      try {
        // First check if the category exists and belongs to the current user
        const category = await categoryService.getByUid(params.id);
        if (!category) {
          return { message: "Category not found" };
        }

        // Users can't modify default categories
        if (!category.userId) {
          return { message: "You cannot modify default categories" };
        }

        if (category.userId !== user.id) {
          return {
            message: "You don't have permission to modify this category",
          };
        }

        return await categoryService.update(params.id, {
          name: body.name,
          type: body.type,
          userId: user.id,
        });
      } catch (error) {
        return { message: "Failed to update category" };
      }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.String(),
        type: t.Union([
          t.Literal("income"),
          t.Literal("expense"),
          t.Literal("transfer"),
        ]),
      }),
      response: {
        200: t.Any(),
        404: t.Object({ message: t.String() }),
        403: t.Object({ message: t.String() }),
        500: t.Object({ message: t.String() }),
      },
    }
  )
  .delete(
    "/categories/:id",
    async ({ params, user }) => {
      try {
        // First check if the category exists and belongs to the current user
        const category = await categoryService.getByUid(params.id);
        if (!category) {
          return { message: "Category not found" };
        }

        // Users can't delete default categories
        if (!category.userId) {
          return { message: "You cannot delete default categories" };
        }

        if (category.userId !== user.id) {
          return {
            message: "You don't have permission to delete this category",
          };
        }

        return await categoryService.remove(params.id);
      } catch (error) {
        return { message: "Failed to delete category" };
      }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Any(),
        404: t.Object({ message: t.String() }),
        403: t.Object({ message: t.String() }),
        500: t.Object({ message: t.String() }),
      },
    }
  );
