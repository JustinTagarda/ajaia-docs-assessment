import { describe, expect, it } from "vitest";
import { MAX_IMPORT_BYTES } from "./documentValidation";
import { importTextFile, textToTiptapContent } from "./documentImport";

function file(name: string, text: string, size = text.length) {
  return { name, size, text: async () => text };
}

describe("document import", () => {
  it("converts the supported Markdown subset into structured Tiptap content", () => {
    expect(textToTiptapContent("# Brief\n- First\n- Second", true)).toEqual({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Brief" }] },
        { type: "bulletList", content: [
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "First" }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Second" }] }] },
        ] },
      ],
    });
  });

  it("creates a title from a valid text file", async () => {
    await expect(importTextFile(file("notes.txt", "Ready to review."))).resolves.toMatchObject({ title: "notes" });
  });

  it("does not include undefined fields in blank paragraphs", () => {
    expect(textToTiptapContent("First paragraph\n\nSecond paragraph", false)).toEqual({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "First paragraph" }] },
        { type: "paragraph" },
        { type: "paragraph", content: [{ type: "text", text: "Second paragraph" }] },
      ],
    });
  });

  it("rejects unsupported, oversized, and empty imports", async () => {
    await expect(importTextFile(file("notes.docx", "not parsed"))).rejects.toThrow(".txt or .md");
    await expect(importTextFile(file("large.md", "small body", MAX_IMPORT_BYTES + 1))).rejects.toThrow("larger than 1 MB");
    await expect(importTextFile(file("empty.txt", "   "))).rejects.toThrow("empty");
  });
});
