import type z from "zod";

class Publisher {
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private contracts = new Map<string, z.ZodType>();

  createChannel<T>(channelId: string, schema: z.ZodType<T>) {
    if (!this.contracts.has(channelId)) {
      this.contracts.set(channelId, schema);
    }

    return this.subscribe<z.infer<typeof schema>>(channelId);
  }

  private subscribe<T>(channelId: string) {
    if (!this.contracts.has(channelId)) {
      throw new Error(`Channel with ID ${channelId} does not exist.`);
    }
    const schema = this.contracts.get(channelId)!;
    return {
      next: (data: T) => {
        const parsed = schema.parse(data);
        const callbacks = this.subscribers.get(channelId);
        if (callbacks) {
          callbacks.forEach((callback) => callback(parsed));
        }
      },
      listen: (callback: (data: T) => void) => {
        const callbacks = this.subscribers.get(channelId) || new Set();
        callbacks.add(callback);
        this.subscribers.set(channelId, callbacks);
        return {
          unsubscribe: () => {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
              this.subscribers.delete(channelId);
            }
          },
        };
      },
    };
  }
}

export const eventPublisher = new Publisher();
