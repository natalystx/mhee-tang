import { Elysia, t } from "elysia";
import { betterAuth } from "@/middlewares/auth.middleware";
import { tagService } from "./tag.service";
import { tagInputSchema } from "./tag.type";

export const tagRouter = new Elysia({ name: "tag-router" })
  .use(betterAuth)
  .get(
    "/tags",
    async ({ user }) => {
      try {
        return await tagService.getAllByUserId(user.id);
      } catch (error) {
        return { message: "Failed to fetch tags" };
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
  .post(
    "/tags",
    async ({ body, user }) => {
      try {
        return await tagService.create({
          name: body.name,
          userId: user.id,
        });
      } catch (error) {
        return { message: "Failed to create tag" };
      }
    },
    {
      auth: true,
      body: t.Object({
        name: t.String(),
      }),
      response: {
        200: t.Any(),
        500: t.Object({ message: t.String() }),
      },
    }
  )
  .get(
    "/tags/:id",
    async ({ params, user }) => {
      try {
        const tag = await tagService.getByUid(params.id);

        // Check if tag exists and belongs to the user
        if (!tag) {
          return { message: "Tag not found" };
        }

        if (tag.userId !== user.id) {
          return { message: "You don't have permission to access this tag" };
        }

        return tag;
      } catch (error) {
        return { message: "Failed to fetch tag" };
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
    "/tags/:id",
    async ({ params, body, user }) => {
      try {
        // First check if the tag exists and belongs to the current user
        const tag = await tagService.getByUid(params.id);
        if (!tag) {
          return { message: "Tag not found" };
        }

        if (tag.userId !== user.id) {
          return { message: "You don't have permission to modify this tag" };
        }

        return await tagService.update(params.id, {
          name: body.name,
          userId: user.id,
        });
      } catch (error) {
        return { message: "Failed to update tag" };
      }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.String(),
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
    "/tags/:id",
    async ({ params, user }) => {
      try {
        // First check if the tag exists and belongs to the current user
        const tag = await tagService.getByUid(params.id);
        if (!tag) {
          return { message: "Tag not found" };
        }

        if (tag.userId !== user.id) {
          return { message: "You don't have permission to delete this tag" };
        }

        return await tagService.remove(params.id);
      } catch (error) {
        return { message: "Failed to delete tag" };
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
