import type { JSONContent } from "@tiptap/react";
import { MAX_IMPORT_BYTES, supportedImportExtensions } from "./documentValidation";

export interface ImportableTextFile {
  name: string;
  size: number;
  text: () => Promise<string>;
}

export interface ImportedDocumentDraft {
  title: string;
  content: JSONContent;
}

function extensionFor(name: string): string {
  const lastDot = name.lastIndexOf(".");
  return lastDot < 0 ? "" : name.slice(lastDot).toLowerCase();
}

function titleFromFilename(name: string): string {
  const extension = extensionFor(name);
  const title = name.slice(0, extension ? -extension.length : undefined).trim();
  return title || "Imported document";
}

function paragraph(text: string): JSONContent {
  return text ? { type: "paragraph", content: [{ type: "text", text }] } : { type: "paragraph" };
}

/** Supports only a small, transparent Markdown subset; all other text remains plain paragraphs. */
export function textToTiptapContent(text: string, isMarkdown: boolean): JSONContent {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const nodes: JSONContent[] = [];
  let listItems: JSONContent[] = [];

  function flushList() {
    if (listItems.length > 0) {
      nodes.push({ type: "bulletList", content: listItems });
      listItems = [];
    }
  }

  for (const line of lines) {
    const heading = isMarkdown ? /^(#{1,2})\s+(.+)$/.exec(line) : null;
    const bullet = isMarkdown ? /^[-*]\s+(.+)$/.exec(line) : null;

    if (heading) {
      flushList();
      nodes.push({ type: "heading", attrs: { level: heading[1].length }, content: [{ type: "text", text: heading[2] }] });
    } else if (bullet) {
      listItems.push({ type: "listItem", content: [paragraph(bullet[1])] });
    } else {
      flushList();
      nodes.push(paragraph(line));
    }
  }
  flushList();

  return { type: "doc", content: nodes.length > 0 ? nodes : [paragraph("")] };
}

export async function importTextFile(file: ImportableTextFile): Promise<ImportedDocumentDraft> {
  const extension = extensionFor(file.name);
  if (!supportedImportExtensions.includes(extension as (typeof supportedImportExtensions)[number])) {
    throw new Error("Import a .txt or .md file. Word documents are not supported in this scoped version.");
  }
  if (file.size > MAX_IMPORT_BYTES) {
    throw new Error("This file is larger than 1 MB. Choose a smaller text or Markdown file.");
  }

  const text = await file.text();
  if (!text.trim()) throw new Error("This file is empty. Choose a file with text to import.");

  return { title: titleFromFilename(file.name), content: textToTiptapContent(text, extension === ".md") };
}
