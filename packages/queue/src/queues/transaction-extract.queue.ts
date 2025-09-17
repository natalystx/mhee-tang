import { createRabbitMQConnection } from "~/client";
import {
  TransactionExtractorPayload,
  transactionExtractorQueue,
} from "~/contracts/transaction-extractor";

const producer = async (payload: TransactionExtractorPayload) => {
  const connection = await createRabbitMQConnection();
  const channel = await connection.createChannel();
  channel.assertQueue(transactionExtractorQueue.name, { durable: true });
  const parsedPayload = transactionExtractorQueue.payloadSchema.parse(payload);
  channel.sendToQueue(
    transactionExtractorQueue.name,
    Buffer.from(JSON.stringify(parsedPayload)),
    { persistent: true }
  );
};

const consumer = async (
  onMessage: (payload: TransactionExtractorPayload) => Promise<void>
) => {
  const connection = await createRabbitMQConnection();
  const channel = await connection.createChannel();
  channel.assertQueue(transactionExtractorQueue.name, { durable: true });
  channel.prefetch(1);
  channel.consume(
    transactionExtractorQueue.name,
    async (msg) => {
      if (msg) {
        try {
          const content = msg.content.toString();
          const parsed = JSON.parse(content);
          const payload = transactionExtractorQueue.payloadSchema.parse(parsed);
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

export const transactionExtractQueue = {
  producer,
  consumer,
};
