# Storage Package

A TypeScript package for interacting with Cloudflare R2 storage using functional programming patterns.

## Installation

```bash
pnpm install @companext/storage
```

## Environment Variables

Set the following environment variables:

```bash
STORAGE_URL=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
```

## Usage

### Option 1: Functional Approach (Individual Functions)

```typescript
import {
  uploadObject,
  getObjectAsBuffer,
  deleteObject,
  objectExists,
} from "@companext/storage"

const config = { bucketName: "my-bucket" }

// Upload
await uploadObject(config)("path/to/file.txt", "Hello, World!", {
  contentType: "text/plain",
  metadata: { author: "user123" },
})

// Read
const buffer = await getObjectAsBuffer(config)("path/to/file.txt")
const content = buffer.toString("utf-8")

// Check existence
const exists = await objectExists(config)("path/to/file.txt")

// Delete
await deleteObject(config)("path/to/file.txt")
```

### Option 2: Pre-configured Storage Object

```typescript
import { createR2Storage } from "@companext/storage"

const storage = createR2Storage("my-bucket")

// Upload
await storage.uploadObject("path/to/file.txt", "Hello, World!")

// Read
const buffer = await storage.getObjectAsBuffer("path/to/file.txt")

// Delete
await storage.deleteObject("path/to/file.txt")
```

### CRUD Operations

#### Upload an Object

```typescript
import { uploadObject } from "@companext/storage"

const config = { bucketName: "my-bucket" }

// Upload a string
await uploadObject(config)("path/to/file.txt", "Hello, World!")

// Upload a buffer with options
const buffer = Buffer.from("Hello, World!")
await uploadObject(config)("path/to/file.txt", buffer, {
  contentType: "text/plain",
  metadata: { author: "user123" },
  cacheControl: "max-age=3600",
})
```

#### Download an Object

```typescript
import { getObject, getObjectAsBuffer } from "@companext/storage"

const config = { bucketName: "my-bucket" }

// Get object response
const response = await getObject(config)("path/to/file.txt")

// Get object as buffer
const buffer = await getObjectAsBuffer(config)("path/to/file.txt")
const content = buffer.toString("utf-8")
```

#### Delete an Object

```typescript
import { deleteObject } from "@companext/storage"

const config = { bucketName: "my-bucket" }
await deleteObject(config)("path/to/file.txt")
```

#### Check if Object Exists

```typescript
import { objectExists } from "@companext/storage"

const config = { bucketName: "my-bucket" }
const exists = await objectExists(config)("path/to/file.txt")
```

### Advanced Operations

#### List Objects

```typescript
import { listObjects } from "@companext/storage"

const config = { bucketName: "my-bucket" }

// List all objects
const result = await listObjects(config)()

// List with prefix and limit
const result = await listObjects(config)({
  prefix: "uploads/",
  maxKeys: 10,
})

console.log(result.Contents) // Array of objects
```

#### Copy and Move Objects

```typescript
import { copyObject, moveObject } from "@companext/storage"

const config = { bucketName: "my-bucket" }

// Copy an object
await copyObject(config)("source/file.txt", "destination/file.txt")

// Move an object (copy + delete source)
await moveObject(config)("source/file.txt", "destination/file.txt")
```

#### Get Object Metadata

```typescript
import { getObjectMetadata } from "@companext/storage"

const config = { bucketName: "my-bucket" }
const metadata = await getObjectMetadata(config)("path/to/file.txt")

console.log(metadata.ContentLength)
console.log(metadata.LastModified)
console.log(metadata.Metadata)
```

#### Delete Multiple Objects

```typescript
import { deleteObjects } from "@companext/storage"

const config = { bucketName: "my-bucket" }
await deleteObjects(config)(["file1.txt", "file2.txt", "file3.txt"])
```

### Presigned URLs

#### Generate Upload URL

```typescript
import { getUploadUrl } from "@companext/storage"

const config = { bucketName: "my-bucket" }

// Generate a presigned URL for uploading (valid for 1 hour)
const uploadUrl = await getUploadUrl(config)("path/to/file.txt")

// Custom expiration (2 hours)
const uploadUrl = await getUploadUrl(config)("path/to/file.txt", 7200)
```

#### Generate Download URL

```typescript
import { getDownloadUrl } from "@companext/storage"

const config = { bucketName: "my-bucket" }

// Generate a presigned URL for downloading (valid for 1 hour)
const downloadUrl = await getDownloadUrl(config)("path/to/file.txt")

// Custom expiration (30 minutes)
const downloadUrl = await getDownloadUrl(config)("path/to/file.txt", 1800)
```

### Function Composition

You can easily compose functions for more complex operations:

```typescript
import {
  uploadObject,
  getObjectAsBuffer,
  deleteObject,
} from "@companext/storage"

const config = { bucketName: "my-bucket" }

// Create a pipeline for processing files
const processFile = async (key: string, content: string) => {
  // Upload
  await uploadObject(config)(key, content)

  // Verify upload
  const downloaded = await getObjectAsBuffer(config)(key)
  const downloadedContent = downloaded.toString("utf-8")

  if (downloadedContent === content) {
    console.log("File uploaded and verified successfully")
  } else {
    // Cleanup on failure
    await deleteObject(config)(key)
    throw new Error("File verification failed")
  }
}
```

### Custom Client Configuration

```typescript
import { createR2Client, uploadObject } from "@companext/storage"

// Create a custom client with different configuration
const customClient = createR2Client()

const config = {
  bucketName: "my-bucket",
  client: customClient,
}

await uploadObject(config)("file.txt", "content")
```

## Error Handling

```typescript
import { getObject } from "@companext/storage"

const config = { bucketName: "my-bucket" }

try {
  await getObject(config)("non-existent-file.txt")
} catch (error) {
  if (error.name === "NoSuchKey") {
    console.log("File not found")
  } else {
    console.error("Unexpected error:", error)
  }
}
```

## Types

### R2Config

```typescript
interface R2Config {
  bucketName: string
  client?: S3Client
}
```

### R2UploadOptions

```typescript
interface R2UploadOptions {
  contentType?: string
  metadata?: Record<string, string>
  cacheControl?: string
}
```

### R2ListOptions

```typescript
interface R2ListOptions {
  prefix?: string
  maxKeys?: number
  continuationToken?: string
}
```

## Example: Functional File Service

```typescript
import {
  uploadObject,
  getObjectAsBuffer,
  deleteObject,
  objectExists,
} from "@companext/storage"

const createFileService = (bucketName: string) => {
  const config = { bucketName }

  const uploadUserAvatar = async (
    userId: string,
    imageBuffer: Buffer
  ): Promise<string> => {
    const key = `avatars/${userId}.jpg`

    await uploadObject(config)(key, imageBuffer, {
      contentType: "image/jpeg",
      metadata: { userId },
      cacheControl: "max-age=86400", // 24 hours
    })

    return key
  }

  const getUserAvatar = async (userId: string): Promise<Buffer | null> => {
    const key = `avatars/${userId}.jpg`

    if (!(await objectExists(config)(key))) {
      return null
    }

    return await getObjectAsBuffer(config)(key)
  }

  const deleteUserAvatar = async (userId: string): Promise<void> => {
    const key = `avatars/${userId}.jpg`

    if (await objectExists(config)(key)) {
      await deleteObject(config)(key)
    }
  }

  return {
    uploadUserAvatar,
    getUserAvatar,
    deleteUserAvatar,
  }
}

// Usage
const fileService = createFileService("user-assets")
await fileService.uploadUserAvatar("user123", imageBuffer)
```
