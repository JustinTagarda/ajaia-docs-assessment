import type { JSONContent } from "@tiptap/react";
import { z } from "zod";

export const MAX_DOCUMENT_CONTENT_BYTES = 900_000;
export const MAX_IMPORT_BYTES = 1_000_000;
export const supportedImportExtensions = [".txt", ".md"] as const;

export const shareEmailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .transform((email) => email.toLowerCase());

export const documentRoleSchema = z.enum(["viewer", "editor"]);

export const documentTitleSchema = z
  .string()
  .trim()
  .min(1, "Enter a document title.")
  .max(120, "Document titles must be 120 characters or fewer.");

const editorContentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.unknown()).max(2_000),
});

export function emptyDocumentContent(): JSONContent {
  return { type: "doc", content: [{ type: "paragraph" }] };
}

export function normalizedDocumentTitle(title: string): string {
  return documentTitleSchema.parse(title);
}

export function validateDocumentContent(content: JSONContent): JSONContent {
  editorContentSchema.parse(content);
  const serialized = JSON.stringify(content);

  if (new TextEncoder().encode(serialized).length > MAX_DOCUMENT_CONTENT_BYTES) {
    throw new Error("This document is too large to save.");
  }

  return content;
}
