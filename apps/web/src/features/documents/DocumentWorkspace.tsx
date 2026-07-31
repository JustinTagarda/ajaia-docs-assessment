import { useRef, useState } from "react";
import type { UserProfile } from "../auth/types";
import { DocumentEditor } from "./DocumentEditor";
import { documentLoadErrorMessage } from "./documentErrors";
import { importTextFile } from "./documentImport";
import { useCreateOwnedDocument, useOwnedDocument, useOwnedDocuments, useSharedDocuments } from "./useDocuments";

export function DocumentWorkspace({ profile }: { profile: UserProfile }) {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const flushEditor = useRef<() => Promise<boolean>>(async () => true);
  const documents = useOwnedDocuments(profile);
  const sharedDocuments = useSharedDocuments(profile);
  const selectedDocument = useOwnedDocument(profile, selectedDocumentId);
  const createDocument = useCreateOwnedDocument(profile);

  async function selectDocument(documentId: string) {
    if (!(await flushEditor.current())) return;
    setSelectedDocumentId(documentId);
  }

  async function createAndOpenDocument() {
    if (!(await flushEditor.current())) return;
    try {
      const document = await createDocument.mutateAsync(undefined);
      setSelectedDocumentId(document.id);
    } catch {
      // Mutation state renders a safe recovery message below the action.
    }
  }

  async function importAndOpenDocument(file: File | undefined) {
    if (!file || !(await flushEditor.current())) return;
    try {
      setImportError(null);
      const draft = await importTextFile(file);
      const document = await createDocument.mutateAsync(draft);
      setSelectedDocumentId(document.id);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "";
      setImportError(message.startsWith("Import ") || message.startsWith("This file") || message.startsWith("Word documents") || message.startsWith("That file")
        ? message
        : "Couldn’t import that file. Please try again.");
    }
  }

  return (
    <section className="document-workspace">
      <aside className="document-sidebar" aria-label="Documents">
        <div className="sidebar-heading"><h2>My documents</h2><button type="button" onClick={() => void createAndOpenDocument()} disabled={createDocument.isPending}>New document</button></div>
        <label className="import-button">Import .txt or .md<input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={(event) => { void importAndOpenDocument(event.target.files?.[0]); event.currentTarget.value = ""; }} disabled={createDocument.isPending} /></label>
        <p className="import-note">Text and Markdown only, up to 1 MB. `.docx` is not supported.</p>
        {importError && <p className="form-error" role="alert">{importError}</p>}
        {createDocument.isError && <p className="form-error" role="alert">Couldn’t create a document. Please try again.</p>}
        {documents.isLoading && <p className="sidebar-message">Loading documents…</p>}
        {documents.isError && <p className="form-error" role="alert">{documentLoadErrorMessage(documents.error)}</p>}
        {documents.data?.length === 0 && <p className="sidebar-message">No documents yet. Create your first one.</p>}
        <div className="document-list">
          {documents.data?.map((document) => <button key={document.id} type="button" className={selectedDocumentId === document.id ? "document-list-item selected" : "document-list-item"} onClick={() => void selectDocument(document.id)}>{document.title}</button>)}
        </div>
        <div className="shared-documents-section">
          <h2>Shared with me</h2>
          {sharedDocuments.isLoading && <p className="sidebar-message">Loading shared documents…</p>}
          {sharedDocuments.isError && <p className="form-error" role="alert">{documentLoadErrorMessage(sharedDocuments.error)}</p>}
          {sharedDocuments.data?.length === 0 && <p className="sidebar-message">Nothing shared with you yet.</p>}
          <div className="document-list">
            {sharedDocuments.data?.map((document) => <button key={document.id} type="button" className={selectedDocumentId === document.id ? "document-list-item selected" : "document-list-item"} onClick={() => void selectDocument(document.id)}>{document.title}</button>)}
          </div>
        </div>
      </aside>
      <main className="editor-pane">
        {!selectedDocumentId && <div className="editor-empty"><h2>Select or create a document</h2><p>Your work is saved automatically as you write.</p></div>}
        {selectedDocument.isLoading && <div className="editor-empty">Opening document…</div>}
        {selectedDocument.isError && <div className="editor-empty"><h2>Couldn’t open this document</h2><p>It may be unavailable. Select another document and try again.</p></div>}
        {selectedDocument.data && <DocumentEditor document={selectedDocument.data} profile={profile} registerFlush={(flush) => { flushEditor.current = flush; }} />}
      </main>
    </section>
  );
}
