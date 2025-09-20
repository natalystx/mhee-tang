import { fileTypeFromBuffer } from "file-type";
import { transactionBiz } from "./transaction.biz";
import {
  type UploadTransactionInput,
  type TransactionInput,
} from "./transaction.type";
import {
  transactionResultQueue,
  transactionExtractQueue,
} from "@mhee-tang/queue";
import { documentService } from "@mhee-tang/storage";
import { v7 as uuid } from "uuid";
import { db } from "@/db";
import { transactionQueue } from "./transaction.queue";

const INVALID_TRANSACTION_NAME = "Invalid transaction";

const queueTransactionExtract = async (
  data: UploadTransactionInput,
  userId: string
) => {
  try {
    const payload = data.images.map(async ({ image }) => {
      const fileBuffer = Buffer.from(image, "base64");
      const fileType = await fileTypeFromBuffer(fileBuffer);

      return {
        content: Buffer.from(fileBuffer).toString("base64"),
        mimeType: fileType?.mime || "application/octet-stream",
        name: uuid(),
        ext: fileType?.ext || "bin",
      };
    });
    const awaitedPayload = await Promise.all(payload);

    return await transactionExtractQueue.producer({
      images: awaitedPayload,
      userId: userId,
    });
  } catch (error) {
    throw error;
  }
};

const onTransactionExtractCompleted = async () => {
  return await transactionResultQueue.consumer(async (data) => {
    const userId = data.userId;
    await documentService.deleteDirectory(
      `transactions/${userId}/${data.batchId}`
    );
    for (const item of data.transactions.filter(
      (i) => i.name !== INVALID_TRANSACTION_NAME
    )) {
      let categoryId: string | null = null;

      if (!!item.category) {
        const category = await db.query.category.findFirst({
          where: (cat, { eq, or, isNull }) =>
            eq(cat.slug, item.category!) &&
            or(eq(cat.userId, userId), isNull(cat.userId)),
        });
        categoryId = category?.uid || null;
      }

      // Create the transaction
      const createdTransaction = await transactionBiz.create({
        name: item.name,
        amount: String(item.amount),
        currency: item.currency,
        type: item.type,
        transactionDate: new Date(item.transactionDate),
        bankName: item.bankName || null,
        source: item.source || null,
        receiver: item.receiver || null,
        notes: item.notes || null,
        userId: userId,
        categoryId: categoryId || undefined,
      });

      // If this is an expense with a category, update any associated budget
      if (categoryId && item.type === "expense") {
        transactionQueue.onUpdatedTransaction.next({
          userId: userId,
          categoryId: categoryId,
          amount: item.amount,
          uid: createdTransaction[0].uid!,
          actionType: "add",
        });
      }
    }
  });
};

export const transactionService = {
  ...transactionBiz,
  queueTransactionExtract,
  onTransactionExtractCompleted,
};
