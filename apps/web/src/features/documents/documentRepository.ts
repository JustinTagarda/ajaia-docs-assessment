import {
  addDoc,
  collection,
  doc,
  FieldPath,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";
import { getFirebaseServices } from "../../lib/firebase";
import type { UserProfile } from "../auth/types";
import { documentRoleSchema, emptyDocumentContent, normalizedDocumentTitle, shareEmailSchema, validateDocumentContent } from "./documentValidation";
import type { DocumentDraft, DocumentRole, DocumentSummary, WorkspaceDocument } from "./types";

function toTimestamp(value: unknown): WorkspaceDocument["updatedAt"] {
  return value && typeof value === "object" && "toDate" in value ? (value as WorkspaceDocument["updatedAt"]) : null;
}

function fromSnapshot(snapshot: DocumentSnapshot<DocumentData>): WorkspaceDocument {
  if (!snapshot.exists()) {
    throw new Error("This document is no longer available.");
  }

  const data = snapshot.data();
  const title = normalizedDocumentTitle(String(data.title ?? ""));
  const content = validateDocumentContent(data.content);

  if (typeof data.ownerId !== "string" || typeof data.ownerEmail !== "string" || !data.access || typeof data.access !== "object") {
    throw new Error("This document has an invalid data shape.");
  }

  const access = Object.fromEntries(Object.entries(data.access).map(([uid, role]) => [uid, documentRoleSchema.parse(role)]));

  return {
    id: snapshot.id,
    title,
    content,
    ownerId: data.ownerId,
    ownerEmail: data.ownerEmail,
    access,
    createdAt: toTimestamp(data.createdAt),
    updatedAt: toTimestamp(data.updatedAt),
  };
}

export async function listOwnedDocuments(profile: UserProfile): Promise<DocumentSummary[]> {
  const { db } = getFirebaseServices();
  const ownedQuery = query(
    collection(db, "documents"),
    where("ownerId", "==", profile.uid),
    orderBy("updatedAt", "desc"),
  );
  const snapshot = await getDocs(ownedQuery);

  return snapshot.docs.map((document) => {
    const parsed = fromSnapshot(document);
    return { id: parsed.id, title: parsed.title, updatedAt: parsed.updatedAt };
  });
}

export async function listSharedDocuments(profile: UserProfile): Promise<DocumentSummary[]> {
  const { db } = getFirebaseServices();
  const sharedQuery = query(
    collection(db, "documents"),
    where(new FieldPath("access", profile.uid), "in", ["viewer", "editor"]),
  );
  const snapshot = await getDocs(sharedQuery);

  return snapshot.docs
    .map((document) => {
      const parsed = fromSnapshot(document);
      return { id: parsed.id, title: parsed.title, updatedAt: parsed.updatedAt };
    })
    .sort((left, right) => (right.updatedAt?.toMillis() ?? 0) - (left.updatedAt?.toMillis() ?? 0));
}

export async function getAccessibleDocument(documentId: string, profile: UserProfile): Promise<WorkspaceDocument> {
  const { db } = getFirebaseServices();
  const result = fromSnapshot(await getDoc(doc(db, "documents", documentId)));

  if (result.ownerId !== profile.uid && !result.access[profile.uid]) {
    throw new Error("You do not have access to this document.");
  }

  return result;
}

export async function createOwnedDocument(profile: UserProfile, draft?: DocumentDraft): Promise<WorkspaceDocument> {
  const { db } = getFirebaseServices();
  const title = draft ? normalizedDocumentTitle(draft.title) : "Untitled document";
  const content = draft ? validateDocumentContent(draft.content) : emptyDocumentContent();
  const reference = await addDoc(collection(db, "documents"), {
    title,
    content,
    ownerId: profile.uid,
    ownerEmail: profile.email,
    access: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: reference.id,
    title,
    content,
    ownerId: profile.uid,
    ownerEmail: profile.email,
    access: {},
    createdAt: null,
    updatedAt: null,
  };
}

export async function saveEditableDocument(documentId: string, draft: DocumentDraft): Promise<void> {
  const { db } = getFirebaseServices();
  await updateDoc(doc(db, "documents", documentId), {
    title: normalizedDocumentTitle(draft.title),
    content: validateDocumentContent(draft.content),
    updatedAt: serverTimestamp(),
  });
}

async function findProfileByEmail(email: string): Promise<UserProfile> {
  const { db } = getFirebaseServices();
  const normalizedEmail = shareEmailSchema.parse(email);
  const result = await getDocs(query(collection(db, "users"), where("email", "==", normalizedEmail)));
  const profile = result.docs[0];
  if (!profile) throw new Error("That email does not belong to a registered Ajaia Docs user.");

  const data = profile.data();
  if (typeof data.email !== "string" || typeof data.name !== "string") {
    throw new Error("That user profile is incomplete. Ask the recipient to sign in again.");
  }

  return { uid: profile.id, email: data.email, name: data.name, createdAt: toTimestamp(data.createdAt) };
}

export async function shareDocument(document: WorkspaceDocument, owner: UserProfile, email: string, role: DocumentRole): Promise<void> {
  if (document.ownerId !== owner.uid) throw new Error("Only the document owner can manage sharing.");
  const recipient = await findProfileByEmail(email);
  if (recipient.uid === owner.uid) throw new Error("You already own this document.");

  const { db } = getFirebaseServices();
  await updateDoc(doc(db, "documents", document.id), {
    access: { ...document.access, [recipient.uid]: documentRoleSchema.parse(role) },
    updatedAt: serverTimestamp(),
  });
}

export async function removeDocumentShare(document: WorkspaceDocument, owner: UserProfile, recipientUid: string): Promise<void> {
  if (document.ownerId !== owner.uid) throw new Error("Only the document owner can manage sharing.");
  if (!(recipientUid in document.access)) return;

  const { db } = getFirebaseServices();
  const nextAccess = { ...document.access };
  delete nextAccess[recipientUid];
  await updateDoc(doc(db, "documents", document.id), { access: nextAccess, updatedAt: serverTimestamp() });
}

export async function getShareRecipients(access: WorkspaceDocument["access"]): Promise<Array<UserProfile & { role: DocumentRole }>> {
  const { db } = getFirebaseServices();
  return Promise.all(Object.entries(access).map(async ([uid, role]) => {
    const snapshot = await getDoc(doc(db, "users", uid));
    const data = snapshot.data();
    return {
      uid,
      email: typeof data?.email === "string" ? data.email : "Unknown user",
      name: typeof data?.name === "string" ? data.name : "Unknown user",
      createdAt: toTimestamp(data?.createdAt),
      role,
    };
  }));
}
