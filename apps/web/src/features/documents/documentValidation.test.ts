import { describe, expect, it } from "vitest";
import { documentRoleSchema, emptyDocumentContent, MAX_DOCUMENT_CONTENT_BYTES, normalizedDocumentTitle, shareEmailSchema, validateDocumentContent } from "./documentValidation";

describe("document validation", () => {
  it("creates an editable empty document", () => {
    expect(emptyDocumentContent()).toEqual({ type: "doc", content: [{ type: "paragraph" }] });
  });

  it("normalizes valid titles and rejects empty titles", () => {
    expect(normalizedDocumentTitle("  Project brief ")).toBe("Project brief");
    expect(() => normalizedDocumentTitle("  ")).toThrow("Enter a document title.");
  });

  it("rejects an oversized rich-text payload", () => {
    const oversized = { type: "doc" as const, content: [{ type: "paragraph", content: [{ type: "text", text: "a".repeat(MAX_DOCUMENT_CONTENT_BYTES) }] }] };
    expect(() => validateDocumentContent(oversized)).toThrow("This document is too large to save.");
  });

  it("normalizes share emails and rejects unsupported roles", () => {
    expect(shareEmailSchema.parse("  MEMBER@Example.COM ")).toBe("member@example.com");
    expect(() => documentRoleSchema.parse("owner")).toThrow();
  });
});
