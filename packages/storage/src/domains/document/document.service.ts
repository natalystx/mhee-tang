import { documentBiz } from "./document.biz";

export const documentService = {
  uploadDocument: documentBiz.uploadDocument,
  downloadDocument: documentBiz.downloadDocument,
  listDocuments: documentBiz.listDocuments,
  listDocumentsWithPrefix: documentBiz.listDocumentsWithPrefix,
  deleteDocument: documentBiz.deleteDocument,
  listDocumentsWithPrefixAsBuffer: documentBiz.listDocumentsWithPrefixAsBuffer,
};
