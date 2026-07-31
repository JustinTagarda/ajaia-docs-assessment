import { useEffect, useState } from "react";
import type { UserProfile } from "../auth/types";
import { getShareRecipients } from "./documentRepository";
import { shareEmailSchema } from "./documentValidation";
import type { DocumentRole, WorkspaceDocument } from "./types";
import { useRemoveDocumentShare, useShareDocument } from "./useDocuments";

interface SharePanelProps {
  document: WorkspaceDocument;
  profile: UserProfile;
}

export function SharePanel({ document, profile }: SharePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<DocumentRole>("viewer");
  const [error, setError] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<Array<UserProfile & { role: DocumentRole }>>([]);
  const share = useShareDocument(profile);
  const removeShare = useRemoveDocumentShare(profile);

  useEffect(() => {
    let active = true;
    void getShareRecipients(document.access).then(
      (nextRecipients) => { if (active) setRecipients(nextRecipients); },
      () => { if (active) setError("Couldn’t load sharing details. Please try again."); },
    );
    return () => { active = false; };
  }, [document.access]);

  async function submit() {
    const emailResult = shareEmailSchema.safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }
    setError(null);
    try {
      await share.mutateAsync({ document, email: emailResult.data, role });
      setEmail("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Couldn’t update sharing. Please try again.");
    }
  }

  async function remove(recipientUid: string) {
    setError(null);
    try {
      await removeShare.mutateAsync({ document, recipientUid });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Couldn’t remove access. Please try again.");
    }
  }

  return (
    <div className="share-control">
      <button type="button" className="secondary-button" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>Share</button>
      {isOpen && <section className="share-panel" aria-label="Document sharing">
        <h2>Share document</h2>
        <p>Invite an existing Ajaia Docs user by email.</p>
        <div className="share-form">
          <input aria-label="Recipient email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
          <select aria-label="Recipient role" value={role} onChange={(event) => setRole(event.target.value as DocumentRole)}>
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button type="button" onClick={() => void submit()} disabled={share.isPending}>Share</button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="share-recipients">
          {recipients.length === 0 && <p>No one else has access yet.</p>}
          {recipients.map((recipient) => <div className="share-recipient" key={recipient.uid}>
            <div><strong>{recipient.name}</strong><span>{recipient.email}</span></div>
            <select aria-label={`${recipient.email} role`} value={recipient.role} onChange={(event) => {
              const nextRole = event.target.value as DocumentRole;
              setError(null);
              void share.mutateAsync({ document, email: recipient.email, role: nextRole }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Couldn’t update sharing."));
            }} disabled={share.isPending}>
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <button type="button" className="remove-share-button" onClick={() => void remove(recipient.uid)} disabled={removeShare.isPending}>Remove</button>
          </div>)}
        </div>
      </section>}
    </div>
  );
}
