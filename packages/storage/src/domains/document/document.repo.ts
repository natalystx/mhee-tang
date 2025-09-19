import { createR2Storage, R2UploadOptions } from "~/client";
import { env } from "~/env";

const DOWNLOAD_LINK_EXPIRE_IN = 3600 * 24; // 24 hours

const r2: ReturnType<typeof createR2Storage> = createR2Storage(
  env.R2_BUCKET_NAME
);

const uploadFile = async (
  fileName: string,
  content: Buffer,
  options: R2UploadOptions
) => {
  await r2.uploadObject(fileName, content, options);
};

const downloadFile = async (fileName: string) => {
  const url = await r2.getDownloadUrl(fileName, DOWNLOAD_LINK_EXPIRE_IN);
  return url;
};

const deleteFile = async (fileName: string) => {
  await r2.deleteObject(fileName);
};

const listFiles = async (): Promise<ReturnType<typeof r2.listObjects>> => {
  const files = await r2.listObjects();

  return files;
};

const listFilesWithPrefix = async (
  prefix: string
): Promise<ReturnType<typeof r2.listObjects>> => {
  const files = await r2.listObjects({ prefix });
  return files;
};

const listFilesWithPrefixAsBuffer = async (prefix: string) => {
  const objects = await r2.listObjects({ prefix });

  let files: Buffer[] = [];
  if (objects.Contents) {
    for (const obj of objects.Contents) {
      if (obj.Key) {
        const fileBuffer = await r2.getObjectAsBuffer(obj.Key);
        files.push(fileBuffer);
      }
    }
  }

  return files;
};

const deleteDirectory = async (prefix: string) => {
  return await r2.deleteDirectory(prefix);
};

export const documentRepo = {
  uploadFile,
  downloadFile,
  deleteFile,
  listFiles,
  listFilesWithPrefix,
  listFilesWithPrefixAsBuffer,
  deleteDirectory,
};
