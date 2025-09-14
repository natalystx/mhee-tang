import { documentRepo } from "./document.repo"

type UploadDocumentParams = {
  ownerId: string
  folderName: string
  content: Buffer
  ext: string
  mimeType: string
}

const uploadDocument = async (params: UploadDocumentParams) => {
  try {
    const { ownerId, folderName, content, ext, mimeType } = params

    const fileNamed = `${folderName}/${ownerId}.${ext}`
    await documentRepo.uploadFile(fileNamed, content, {
      contentType: mimeType,
      metadata: {
        ownerId,
        folderName,
        ext,
        mimeType,
      },
    })
    return {
      folderName,
      documentId: ownerId,
    }
  } catch (error) {
    console.error("Error uploading document:", error)
    throw new Error("Failed to upload document")
  }
}

const downloadDocument = async (folderName: string, documentId: string) => {
  try {
    const url = await documentRepo.downloadFile(`${folderName}/${documentId}`)
    return { url }
  } catch (error) {
    console.error("Error downloading document:", error)
    throw new Error("Failed to download document")
  }
}

const deleteDocument = async (
  folderName: string,
  documentId: string
): Promise<boolean> => {
  try {
    await documentRepo.deleteFile(`${folderName}/${documentId}`)
    return true
  } catch (error) {
    return false
  }
}

const listDocuments = async () => {
  try {
    const files = await documentRepo.listFiles()
    return files
  } catch (error) {
    return []
  }
}

const listDocumentsWithPrefix = async (prefix: string) => {
  try {
    const files = await documentRepo.listFilesWithPrefix(prefix)
    return files
  } catch (error) {
    return []
  }
}

export const documentBiz = {
  uploadDocument,
  downloadDocument,
  deleteDocument,
  listDocuments,
  listDocumentsWithPrefix,
}
