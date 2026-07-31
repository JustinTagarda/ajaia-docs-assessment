import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useCallback, useEffect, useRef, useState } from "react";
import { saveEditableDocument } from "./documentRepository";
import { documentTitleSchema } from "./documentValidation";
import { createSerializedSaveQueue } from "./saveQueue";
import type { DocumentDraft, SaveStatus, WorkspaceDocument } from "./types";
import type { UserProfile } from "../auth/types";
import { SharePanel } from "./SharePanel";
import { canEditDocument, documentPermission } from "./documentPermissions";

interface DocumentEditorProps {
  document: WorkspaceDocument;
  profile: UserProfile;
  registerFlush: (flush: () => Promise<boolean>) => void;
}

function saveLabel(status: SaveStatus, isDirty: boolean): string {
  if (status === "error") return "Couldn’t save";
  if (status === "saving" || isDirty) return "Saving…";
  return "Saved";
}

export function DocumentEditor({ document, profile, registerFlush }: DocumentEditorProps) {
  const permission = documentPermission(document, profile);
  const canEdit = canEditDocument(permission);
  const [draft, setDraft] = useState<DocumentDraft>({ title: document.title, content: document.content });
  const draftRef = useRef<DocumentDraft>({ title: document.title, content: document.content });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [isDirty, setIsDirty] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const queue = useRef<ReturnType<typeof createSerializedSaveQueue<DocumentDraft>> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2] } }), Underline],
    content: document.content,
    editable: canEdit,
    editorProps: { attributes: { class: "rich-text-editor", "aria-label": "Document content" } },
    onUpdate: ({ editor: currentEditor }) => {
      if (!canEdit) return;
      const content = currentEditor.getJSON();
      const nextDraft = { ...draftRef.current, content };
      draftRef.current = nextDraft;
      setDraft(nextDraft);
      queue.current?.update(nextDraft);
      setIsDirty(true);
    },
  });

  useEffect(() => {
    const initialDraft = { title: document.title, content: document.content };
    draftRef.current = initialDraft;
    setDraft(initialDraft);
    setSaveStatus("saved");
    setIsDirty(false);
    setTitleError(null);
    queue.current = createSerializedSaveQueue(
      (nextDraft) => saveEditableDocument(document.id, nextDraft),
      setSaveStatus,
    );
    if (editor) editor.commands.setContent(document.content, false);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [document.id, document.title, document.content, editor]);

  useEffect(() => {
    editor?.setEditable(canEdit);
  }, [canEdit, editor]);

  const flush = useCallback(async () => {
    if (!canEdit) return true;
    if (timer.current) clearTimeout(timer.current);
    const titleResult = documentTitleSchema.safeParse(draftRef.current.title);

    if (!titleResult.success) {
      setTitleError(titleResult.error.issues[0]?.message ?? "Enter a document title.");
      setSaveStatus("error");
      return false;
    }

    setTitleError(null);
    const saved = await queue.current?.flush() ?? true;
    if (saved) setIsDirty(false);
    return saved;
  }, [canEdit]);

  useEffect(() => {
    registerFlush(flush);
  }, [flush, registerFlush]);

  useEffect(() => {
    if (!isDirty) return;
    timer.current = setTimeout(() => { void flush(); }, 800);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [draft, flush, isDirty]);

  function updateTitle(title: string) {
    if (!canEdit) return;
    const nextDraft = { ...draftRef.current, title };
    draftRef.current = nextDraft;
    setDraft(nextDraft);
    queue.current?.update(nextDraft);
    const titleResult = documentTitleSchema.safeParse(title);
    setTitleError(titleResult.success ? null : (titleResult.error.issues[0]?.message ?? "Enter a document title."));
    setIsDirty(true);
  }

  function applyHeading(level: 1 | 2) {
    if (!editor) return;

    const { state } = editor;
    const { selection } = state;
    const { $from, $to } = selection;

    // Headings are block nodes. A partial selection in a paragraph becomes its
    // own heading, rather than changing the full document or every selected block.
    if (!selection.empty && $from.sameParent($to) && $from.parent.type.name === "paragraph") {
      const paragraphStart = $from.start($from.depth);
      const paragraphEnd = $from.end($from.depth);
      const before = state.doc.slice(paragraphStart, selection.from).content;
      const selected = state.doc.slice(selection.from, selection.to).content;
      const after = state.doc.slice(selection.to, paragraphEnd).content;
      const replacement = [];

      if (before.size > 0) replacement.push($from.parent.type.create($from.parent.attrs, before));
      replacement.push(state.schema.nodes.heading.create({ level }, selected));
      if (after.size > 0) replacement.push($from.parent.type.create($from.parent.attrs, after));

      editor.view.dispatch(state.tr.replaceWith($from.before($from.depth), $from.after($from.depth), replacement));
      return;
    }

    // For a multi-block selection, only affect the paragraph that owns the cursor.
    editor.chain().focus().setTextSelection(selection.from).toggleHeading({ level }).run();
  }

  function editorButton(label: string, action: () => void, active = false) {
    return <button
      type="button"
      disabled={!canEdit}
      className={active ? "toolbar-button active" : "toolbar-button"}
      aria-label={label}
      title={label}
      onMouseDown={(event) => {
        // Keep the ProseMirror selection while using the toolbar.
        event.preventDefault();
        action();
      }}
    >{label}</button>;
  }

  return (
    <section className="document-editor" aria-label="Document editor">
      <div className="document-title-row">
        <div className="document-title-field">
          <input aria-label="Document title" readOnly={!canEdit} aria-invalid={Boolean(titleError)} aria-describedby={titleError ? "document-title-error" : undefined} className="document-title" value={draft.title} onChange={(event) => updateTitle(event.target.value)} maxLength={120} />
          {titleError && <p id="document-title-error" className="title-error" role="alert">{titleError}</p>}
        </div>
        <div className="save-status" role={saveStatus === "error" ? "alert" : "status"}>{saveLabel(saveStatus, isDirty)}</div>
        {permission === "viewer" ? <span className="view-only-status">View only</span> : <><button type="button" className="secondary-button" onClick={() => void flush()}>Save now</button>{permission === "owner" && <SharePanel document={document} profile={profile} />}</>}
      </div>
      <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
        {editorButton("H1", () => applyHeading(1), editor?.isActive("heading", { level: 1 }))}
        {editorButton("H2", () => applyHeading(2), editor?.isActive("heading", { level: 2 }))}
        {editorButton("Bold", () => editor?.chain().focus().toggleBold().run(), editor?.isActive("bold"))}
        {editorButton("Italic", () => editor?.chain().focus().toggleItalic().run(), editor?.isActive("italic"))}
        {editorButton("Underline", () => editor?.chain().focus().toggleUnderline().run(), editor?.isActive("underline"))}
        {editorButton("List", () => editor?.chain().focus().toggleBulletList().run(), editor?.isActive("bulletList"))}
      </div>
      <EditorContent editor={editor} />
      {saveStatus === "error" && <button type="button" className="retry-button" onClick={() => void flush()}>{titleError ? "Fix title to save" : "Retry save"}</button>}
    </section>
  );
}
