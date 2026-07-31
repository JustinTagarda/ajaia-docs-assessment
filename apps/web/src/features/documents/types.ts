import type { JSONContent } from "@tiptap/react";
import type { Timestamp } from "firebase/firestore";

export interface DocumentSummary {
  id: string;
  title: string;
  updatedAt: Timestamp | null;
}

export type DocumentRole = "viewer" | "editor";
export type DocumentPermission = "owner" | DocumentRole;

export interface WorkspaceDocument extends DocumentSummary {
  content: JSONContent;
  ownerId: string;
  ownerEmail: string;
  access: Record<string, DocumentRole>;
  createdAt: Timestamp | null;
}

export interface DocumentDraft {
  title: string;
  content: JSONContent;
}

export type SaveStatus = "saved" | "saving" | "error";
