import { createRabbitMQConnection } from "~/client";
import {
  TransactionExtractorResult,
  transactionExtractorResultQueue,
} from "~/contracts/transaction-extractor";

const producer = async (payload: TransactionExtractorResult) => {
  const connection = await createRabbitMQConnection();
  const channel = await connection.createChannel();
  channel.assertQueue(transactionExtractorResultQueue.name, { durable: true });
  const parsedPayload =
    transactionExtractorResultQueue.payloadSchema.parse(payload);
  channel.sendToQueue(
    transactionExtractorResultQueue.name,
    Buffer.from(JSON.stringify(parsedPayload)),
    { persistent: true }
  );

  return channel.close();
};

const consumer = async (
  onMessage: (payload: TransactionExtractorResult) => Promise<void>
) => {
  const connection = await createRabbitMQConnection();
  const channel = await connection.createChannel();
  channel.assertQueue(transactionExtractorResultQueue.name, { durable: true });
  channel.prefetch(1);
  channel.consume(
    transactionExtractorResultQueue.name,
    async (msg) => {
      if (msg) {
        try {
          const content = msg.content.toString();
          const parsed = JSON.parse(content);
          const payload =
            transactionExtractorResultQueue.payloadSchema.parse(parsed);
          await onMessage(payload);
          channel.ack(msg);
        } catch (error) {
          console.error("Error processing message:", error);
          channel.nack(msg, false, false); // Discard the message
        }
      }
    },
    { noAck: false }
  );
};

export const transactionResultQueue = {
  producer,
  consumer,
};
