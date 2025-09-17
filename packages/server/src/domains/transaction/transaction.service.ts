import { fileTypeFromBuffer } from "file-type";
import { transactionBiz } from "./transaction.biz";
import type { UploadTransactionInput } from "./transaction.type";
import {
  transactionResultQueue,
  transactionExtractQueue,
} from "@mhee-tang/queue";
import { documentService } from "@mhee-tang/storage";
import { v7 as uuid } from "uuid";

const queueTransactionExtract = async (
  data: UploadTransactionInput,
  userId: string
) => {
  try {
    console.log(
      "queueTransactionExtract called with data:",
      JSON.stringify(data, null, 2),
      userId
    );

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
    console.log("Payload prepared for queue:", awaitedPayload);
    return await transactionExtractQueue.producer({
      images: awaitedPayload,
      userId: userId,
    });
  } catch (error) {
    console.error("Error in queueTransactionExtract:", error);
  }
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
        // categoryId: item.category || null,
      });
    }
  });
};

export const transactionService = {
  ...transactionBiz,
  queueTransactionExtract,
  onTransactionExtractCompleted,
};
