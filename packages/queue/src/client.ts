import amqplib from "amqplib";
import { env } from "~/env";

export const createRabbitMQConnection = async () => {
  try {
    const connection = await amqplib.connect(env.RABBITMQ_URL);

    console.log("RabbitMQ connection established successfully.");

    const onShutdown = async () => {
      try {
        await connection.close();
        console.log("RabbitMQ connection closed gracefully.");
      } catch (error) {
        console.error("Error closing RabbitMQ connection:", error);
      }
    };

    process.on("SIGINT", onShutdown);
    process.on("SIGTERM", onShutdown);

    return connection;
  } catch (error) {
    console.error("Error establishing RabbitMQ connection:", error);
    throw error;
  }
};
