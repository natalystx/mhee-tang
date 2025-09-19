// index.ts - Export all schema definitions and their relations
export * from "./auth";
export * from "./transaction";
export * from "./budget";
export * from "./relations";

// This file helps prevent circular dependencies by providing a single import point
// Import from this file instead of importing directly from individual schema files
