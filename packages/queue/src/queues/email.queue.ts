import { EmailPayload, emailQueue } from "../contracts/email";

import { createRabbitMQConnection } from "~/client";

const producer = async (payload: EmailPayload) => {
  const connection = await createRabbitMQConnection();
  const channel = await connection.createChannel();
  channel.assertQueue(emailQueue.name, { durable: true });
  const parsedPayload = emailQueue.payloadSchema.parse(payload);
  channel.sendToQueue(
    emailQueue.name,
    Buffer.from(JSON.stringify(parsedPayload)),
    { persistent: true }
  );

  return channel.close();
};

const consumer = async (
  onMessage: (payload: EmailPayload) => Promise<void>
) => {
  const connection = await createRabbitMQConnection();
  const channel = await connection.createChannel();
  channel.assertQueue(emailQueue.name, { durable: true });
  channel.prefetch(1);
  channel.consume(
    emailQueue.name,
    async (msg) => {
      if (msg) {
        try {
          const content = msg.content.toString();
          const parsed = JSON.parse(content);
          const payload = emailQueue.payloadSchema.parse(parsed);
          await onMessage(payload);
          channel.ack(msg);
        } catch (error) {
          console.error("Error processing message:", error);
          channel.nack(msg, false, false);
        }
      }
    },
    { noAck: false }
  );
};

export const emailJobQueue = {
  producer,
  consumer,
};
