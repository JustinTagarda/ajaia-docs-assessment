import { describe, expect, it } from "vitest";
import { canEditDocument, documentPermission } from "./documentPermissions";
import type { WorkspaceDocument } from "./types";

const document: WorkspaceDocument = {
  id: "doc-1", title: "Brief", content: { type: "doc", content: [{ type: "paragraph" }] }, ownerId: "owner", ownerEmail: "owner@example.com",
  access: { viewer: "viewer", editor: "editor" }, createdAt: null, updatedAt: null,
};

describe("document permissions", () => {
  it("keeps viewers read-only while owners and editors can edit", () => {
    expect(canEditDocument(documentPermission(document, { uid: "owner", email: "owner@example.com", name: "Owner", createdAt: null }))).toBe(true);
    expect(canEditDocument(documentPermission(document, { uid: "editor", email: "editor@example.com", name: "Editor", createdAt: null }))).toBe(true);
    expect(canEditDocument(documentPermission(document, { uid: "viewer", email: "viewer@example.com", name: "Viewer", createdAt: null }))).toBe(false);
  });
});
