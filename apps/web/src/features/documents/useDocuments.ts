import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOwnedDocument, getAccessibleDocument, listOwnedDocuments, listSharedDocuments, removeDocumentShare, shareDocument } from "./documentRepository";
import type { UserProfile } from "../auth/types";
import type { DocumentDraft, DocumentRole, WorkspaceDocument } from "./types";

const documentKeys = {
  owned: (uid: string) => ["documents", "owned", uid] as const,
  shared: (uid: string) => ["documents", "shared", uid] as const,
  detail: (uid: string, documentId: string) => ["documents", "detail", uid, documentId] as const,
};

export function useOwnedDocuments(profile: UserProfile) {
  return useQuery({
    queryKey: documentKeys.owned(profile.uid),
    queryFn: () => listOwnedDocuments(profile),
  });
}

export function useSharedDocuments(profile: UserProfile) {
  return useQuery({ queryKey: documentKeys.shared(profile.uid), queryFn: () => listSharedDocuments(profile) });
}

export function useOwnedDocument(profile: UserProfile, documentId: string | null) {
  return useQuery({
    queryKey: documentKeys.detail(profile.uid, documentId ?? "none"),
    queryFn: () => getAccessibleDocument(documentId!, profile),
    enabled: documentId !== null,
  });
}

export function useCreateOwnedDocument(profile: UserProfile) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (draft?: DocumentDraft) => createOwnedDocument(profile, draft),
    onSuccess: (document) => {
      client.invalidateQueries({ queryKey: documentKeys.owned(profile.uid) });
      client.setQueryData(documentKeys.detail(profile.uid, document.id), document);
    },
  });
}

export function useShareDocument(profile: UserProfile) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ document, email, role }: { document: WorkspaceDocument; email: string; role: DocumentRole }) => shareDocument(document, profile, email, role),
    onSuccess: (_, variables) => client.invalidateQueries({ queryKey: documentKeys.detail(profile.uid, variables.document.id) }),
  });
}

export function useRemoveDocumentShare(profile: UserProfile) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ document, recipientUid }: { document: WorkspaceDocument; recipientUid: string }) => removeDocumentShare(document, profile, recipientUid),
    onSuccess: (_, variables) => client.invalidateQueries({ queryKey: documentKeys.detail(profile.uid, variables.document.id) }),
  });
}

export { documentKeys };
