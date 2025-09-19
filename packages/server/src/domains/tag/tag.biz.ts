import { tagRepo } from "./tag.repo";
import type { TagInput } from "./tag.type";

const create = (data: TagInput) => {
  return tagRepo.create(data);
};

const createMany = (tags: TagInput[]) => {
  return tagRepo.createMany(tags);
};

const getByUid = (uid: string) => {
  return tagRepo.findByUid(uid);
};

const getByName = (name: string, userId: string) => {
  return tagRepo.findByName(name, userId);
};

const getAllByUserId = (userId: string) => {
  return tagRepo.findManyByUserId(userId);
};

const update = (uid: string, data: Partial<TagInput>) => {
  return tagRepo.updateByUid(uid, data);
};

const remove = (uid: string) => {
  return tagRepo.removeByUid(uid);
};

const getByTransactionId = (transactionId: string) => {
  return tagRepo.findByTransactionId(transactionId);
};

// Create or get existing tag and link it to a transaction
const addTagToTransaction = async (
  name: string,
  userId: string,
  transactionId: string
) => {
  const tag = await tagRepo.findOrCreate(name, userId);
  if (!tag.uid) {
    throw new Error("Tag creation failed - missing UID");
  }

  await import("../transaction/transaction.repo").then(
    ({ transactionRepo }) => {
      return transactionRepo.linkTagToTransactions(
        tag.uid as string,
        transactionId
      );
    }
  );
  return tag;
};

// Create or get multiple tags and link them to a transaction
const addTagsToTransaction = async (
  tagNames: string[],
  userId: string,
  transactionId: string
) => {
  const uniqueTagNames = [...new Set(tagNames)]; // Remove duplicates
  const tags = await Promise.all(
    uniqueTagNames.map((name) => tagRepo.findOrCreate(name, userId))
  );

  // Only link tags with valid UIDs
  const validTags = tags.filter((tag) => !!tag.uid);

  await Promise.all(
    validTags.map((tag) =>
      import("../transaction/transaction.repo").then(({ transactionRepo }) => {
        return transactionRepo.linkTagToTransactions(
          tag.uid as string,
          transactionId
        );
      })
    )
  );

  return tags;
};

export const tagBiz = {
  create,
  createMany,
  getByUid,
  getByName,
  getAllByUserId,
  update,
  remove,
  getByTransactionId,
  addTagToTransaction,
  addTagsToTransaction,
};
