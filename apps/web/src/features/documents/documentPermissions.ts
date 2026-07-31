import type { UserProfile } from "../auth/types";
import type { DocumentPermission, WorkspaceDocument } from "./types";

export function documentPermission(document: WorkspaceDocument, profile: UserProfile): DocumentPermission | null {
  return document.ownerId === profile.uid ? "owner" : document.access[profile.uid] ?? null;
}

export function canEditDocument(permission: DocumentPermission | null): boolean {
  return permission === "owner" || permission === "editor";
}
