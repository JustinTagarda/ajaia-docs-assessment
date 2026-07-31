export function documentLoadErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";

  if (code === "failed-precondition") {
    return "The Firestore document-list index is still becoming available. Wait a moment, then refresh.";
  }

  if (code === "permission-denied") {
    return "Firestore denied access to your documents. Confirm that the deployed Firestore Rules match this repository.";
  }

  return "Couldn’t load your documents. Refresh and try again.";
}
