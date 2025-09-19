import { tag, transactionTag } from "@/db/schema/transaction";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { uid } from "@/utils/uid";
import { UID_PREFIX } from "@/constants/uid-prefix";
import type { TagInput } from "./tag.type";

const create = async (data: TagInput) => {
  return db
    .insert(tag)
    .values({ ...data, uid: uid(UID_PREFIX.TAG) })
    .returning();
};

const findByUid = async (uid: string) => {
  return db.query.tag.findFirst({
    where: eq(tag.uid, uid),
  });
};

const findByName = async (name: string, userId: string) => {
  return db.query.tag.findFirst({
    where: (tag, { eq, and }) =>
      and(eq(tag.name, name), eq(tag.userId, userId)),
  });
};

const findManyByUserId = async (userId: string) => {
  return db.query.tag.findMany({
    where: eq(tag.userId, userId),
    orderBy: (tag, { asc }) => [asc(tag.name)],
  });
};

const updateByUid = async (uid: string, data: Partial<TagInput>) => {
  return db.update(tag).set(data).where(eq(tag.uid, uid)).returning();
};

const removeByUid = async (uid: string) => {
  return db.delete(tag).where(eq(tag.uid, uid)).returning();
};

const findByTransactionId = async (transactionId: string) => {
  // Get tag IDs associated with this transaction from the join table
  const tagLinks = await db.query.transactionTag.findMany({
    where: eq(transactionTag.transactionId, transactionId),
  });

  const tagIds = tagLinks.map((link) => link.tagId);

  // If no tags are linked, return empty array
  if (tagIds.length === 0) {
    return [];
  }

  // Get the actual tag objects
  return db.query.tag.findMany({
    where: (tag, { inArray }) => inArray(tag.uid, tagIds),
  });
};

// Find or create a tag - useful for ensuring a tag exists before linking
const findOrCreate = async (name: string, userId: string) => {
  const existingTag = await findByName(name, userId);
  if (existingTag) {
    return existingTag;
  }

  const [newTag] = await create({ name, userId });
  return newTag;
};

// Create multiple tags at once
const createMany = async (tags: TagInput[]) => {
  if (tags.length === 0) return [];

  return db
    .insert(tag)
    .values(
      tags.map((tagData) => ({
        ...tagData,
        uid: uid(UID_PREFIX.TAG),
      }))
    )
    .returning();
};

export const tagRepo = {
  create,
  createMany,
  findByUid,
  findByName,
  findManyByUserId,
  updateByUid,
  removeByUid,
  findByTransactionId,
  findOrCreate,
};
