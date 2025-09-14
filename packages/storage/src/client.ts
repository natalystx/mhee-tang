import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommandOutput,
  ListObjectsV2CommandOutput,
  HeadObjectCommandOutput,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { env } from "./env"

export const createR2Client = () => {
  return new S3Client({
    region: "auto",
    endpoint: env.R2_STORAGE_URL,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  })
}

export interface R2UploadOptions {
  contentType?: string
  metadata?: Record<string, string>
  cacheControl?: string
}

export interface R2ListOptions {
  prefix?: string
  maxKeys?: number
  continuationToken?: string
}

export interface R2Config {
  bucketName: string
  client?: S3Client
}

// Helper function to convert stream/response body to buffer
const streamToBuffer = async (body: any): Promise<Buffer> => {
  const chunks: Uint8Array[] = []

  if (body instanceof ReadableStream) {
    const reader = body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
  } else {
    // For Node.js streams
    for await (const chunk of body) {
      chunks.push(chunk)
    }
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const buffer = new Uint8Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    buffer.set(chunk, offset)
    offset += chunk.length
  }

  return Buffer.from(buffer)
}

/**
 * Upload an object to R2
 */
export const uploadObject =
  (config: R2Config) =>
  async (
    key: string,
    body: Buffer | Uint8Array | string,
    options?: R2UploadOptions
  ): Promise<void> => {
    const client = config.client ?? createR2Client()
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: body,
      ContentType: options?.contentType,
      Metadata: options?.metadata,
      CacheControl: options?.cacheControl,
    })

    await client.send(command)
  }

/**
 * Download an object from R2
 */
export const getObject =
  (config: R2Config) =>
  async (key: string): Promise<GetObjectCommandOutput> => {
    const client = config.client ?? createR2Client()
    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    })

    return await client.send(command)
  }

/**
 * Get object as buffer
 */
export const getObjectAsBuffer =
  (config: R2Config) =>
  async (key: string): Promise<Buffer> => {
    const response = await getObject(config)(key)

    if (!response.Body) {
      throw new Error(`Object ${key} has no body`)
    }

    return await streamToBuffer(response.Body)
  }

/**
 * Delete an object from R2
 */
export const deleteObject =
  (config: R2Config) =>
  async (key: string): Promise<void> => {
    const client = config.client ?? createR2Client()
    const command = new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    })

    await client.send(command)
  }

/**
 * Get object metadata
 */
export const getObjectMetadata =
  (config: R2Config) =>
  async (key: string): Promise<HeadObjectCommandOutput> => {
    const client = config.client ?? createR2Client()
    const command = new HeadObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    })

    return await client.send(command)
  }

/**
 * Check if an object exists
 */
export const objectExists =
  (config: R2Config) =>
  async (key: string): Promise<boolean> => {
    try {
      await getObjectMetadata(config)(key)
      return true
    } catch (error: any) {
      if (
        error.name === "NotFound" ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false
      }
      throw error
    }
  }

/**
 * List objects in the bucket
 */
export const listObjects =
  (config: R2Config) =>
  async (options?: R2ListOptions): Promise<ListObjectsV2CommandOutput> => {
    const client = config.client ?? createR2Client()
    const command = new ListObjectsV2Command({
      Bucket: config.bucketName,
      Prefix: options?.prefix,
      MaxKeys: options?.maxKeys,
      ContinuationToken: options?.continuationToken,
    })

    return await client.send(command)
  }

/**
 * Copy an object within R2
 */
export const copyObject =
  (config: R2Config) =>
  async (sourceKey: string, destinationKey: string): Promise<void> => {
    const client = config.client ?? createR2Client()
    const command = new CopyObjectCommand({
      Bucket: config.bucketName,
      Key: destinationKey,
      CopySource: `${config.bucketName}/${sourceKey}`,
    })

    await client.send(command)
  }

/**
 * Move an object (copy + delete source)
 */
export const moveObject =
  (config: R2Config) =>
  async (sourceKey: string, destinationKey: string): Promise<void> => {
    await copyObject(config)(sourceKey, destinationKey)
    await deleteObject(config)(sourceKey)
  }

/**
 * Get a signed URL for uploading (presigned PUT)
 */
export const getUploadUrl =
  (config: R2Config) =>
  async (key: string, expiresIn: number = 3600): Promise<string> => {
    const client = config.client ?? createR2Client()
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    })

    return await getSignedUrl(client, command, { expiresIn })
  }

/**
 * Get a signed URL for downloading (presigned GET)
 */
export const getDownloadUrl =
  (config: R2Config) =>
  async (key: string, expiresIn: number = 3600): Promise<string> => {
    const client = config.client ?? createR2Client()
    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    })

    return await getSignedUrl(client, command, { expiresIn })
  }

/**
 * Delete multiple objects
 */
export const deleteObjects =
  (config: R2Config) =>
  async (keys: string[]): Promise<void> => {
    const client = config.client ?? createR2Client()
    const command = new DeleteObjectsCommand({
      Bucket: config.bucketName,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    })

    await client.send(command)
  }

// Convenience function to create a pre-configured set of R2 functions
export const createR2Storage = (bucketName: string, client?: S3Client) => {
  const config: R2Config = { bucketName, client }

  return {
    uploadObject: uploadObject(config),
    getObject: getObject(config),
    getObjectAsBuffer: getObjectAsBuffer(config),
    deleteObject: deleteObject(config),
    getObjectMetadata: getObjectMetadata(config),
    objectExists: objectExists(config),
    listObjects: listObjects(config),
    copyObject: copyObject(config),
    moveObject: moveObject(config),
    getUploadUrl: getUploadUrl(config),
    getDownloadUrl: getDownloadUrl(config),
    deleteObjects: deleteObjects(config),
  }
}
