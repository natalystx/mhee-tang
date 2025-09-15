export type TransactionInput = {
  images: {
    content: string;
    mimeType: string;
    name: string;
    ext: string;
  }[];
  userId: string;
};

export type ParseQueuePayload = {
  userId: string;
  batchId: string;
};
