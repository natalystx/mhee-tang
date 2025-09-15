import { fileTypeFromBuffer } from "file-type";
import { transactionBiz } from "./transaction.biz";
import type { UploadTransactionInput } from "./transaction.type";
import {
  transactionResultQueue,
  transactionExtractQueue,
} from "@mhee-tang/queue";
import { documentService } from "@mhee-tang/storage";

const queueTransactionExtract = async (
  data: UploadTransactionInput,
  userId: string
) => {
  const payload = data.images.map(async (item) => {
    const fileBuffer = await item.image.arrayBuffer();
    const fileType = await fileTypeFromBuffer(Buffer.from(fileBuffer));
    return {
      content: Buffer.from(fileBuffer).toString("base64"),
      mimeType: fileType?.mime || "application/octet-stream",
      name: item.image.name,
      ext: fileType?.ext || "bin",
    };
  });
  const awaitedPayload = await Promise.all(payload);
  return await transactionExtractQueue.producer({
    images: awaitedPayload,
    userId: userId,
  });
};

const onTransactionExtractCompleted = async () => {
  return await transactionResultQueue.consumer(async (data) => {
    const userId = data.userId;
    await documentService.deleteDocument(
      `transactions/${userId}`,
      data.batchId
    );
    for (const item of data.transactions) {
      await transactionBiz.create({
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
        categoryId: item.category || null,
      });
    }
  });
};

export const transactionService = {
  ...transactionBiz,
  queueTransactionExtract,
  onTransactionExtractCompleted,
};
