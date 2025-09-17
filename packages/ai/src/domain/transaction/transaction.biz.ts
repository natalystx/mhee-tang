import { documentService } from "@mhee-tang/storage";
import { ParseQueuePayload, TransactionInput } from "./transaction.type";
import { v7 as uuid } from "uuid";
import { generateObject } from "ai";
import { AI_CONFIG } from "~/constants/ai";
import { transactionResultQueue } from "@mhee-tang/queue";
import {
  systemPrompt,
  TransactionPromptOutputSchema,
} from "./transaction.prompt";

const storeTransactions = async (
  payload: TransactionInput
): Promise<ParseQueuePayload> => {
  const batchId = uuid();
  console.log("Storing transactions for batch:", batchId);
  const folderName = `transactions/${payload.userId}/${batchId}`;

  for (const image of payload.images) {
    const imageId = uuid();
    await documentService.uploadDocument({
      ownerId: payload.userId,
      folderName: folderName,
      ext: image.ext,
      mimeType: image.mimeType,
      name: imageId,
      content: Buffer.from(image.content, "base64"),
    });
  }

  return { userId: payload.userId, batchId };
};

const parseTransactions = async (userId: string, batchId: string) => {
  try {
    console.log("Parsing transactions for batch:", batchId);
    const files = await documentService.listDocumentsWithPrefixAsBuffer(
      `transactions/${userId}/${batchId}`
    );
    const response = await generateObject({
      model: AI_CONFIG.model,
      temperature: AI_CONFIG.temperature,
      providerOptions: AI_CONFIG.providerOptions,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: files.map((file) => ({
            type: "image",
            image: Buffer.from(file),
          })),
        },
      ],
      schema: TransactionPromptOutputSchema,
    });
    console.log(
      "AI response received for batch:",
      batchId,
      JSON.stringify(response.usage, null, 2)
    );
    await transactionResultQueue.producer({
      userId,
      transactions: TransactionPromptOutputSchema.parse(response.object),
      batchId,
    });
  } catch (error) {
    throw error;
  }
};

export const transactionBiz = {
  storeTransactions,
  parseTransactions,
};
