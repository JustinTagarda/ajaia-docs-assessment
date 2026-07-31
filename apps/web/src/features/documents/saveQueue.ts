import type { SaveStatus } from "./types";

export function createSerializedSaveQueue<T>(save: (draft: T) => Promise<void>, onStatus: (status: SaveStatus) => void) {
  let latestDraft: T | undefined;
  let revision = 0;
  let savedRevision = 0;
  let activeSave: Promise<boolean> | null = null;

  async function saveLatest(): Promise<boolean> {
    if (activeSave) {
      const previousResult = await activeSave;
      return previousResult && savedRevision < revision ? saveLatest() : previousResult;
    }

    if (latestDraft === undefined || savedRevision === revision) {
      return true;
    }

    const targetRevision = revision;
    const targetDraft = latestDraft;
    onStatus("saving");
    activeSave = save(targetDraft)
      .then(() => {
        savedRevision = targetRevision;
        onStatus("saved");
        return true;
      })
      .catch(() => {
        onStatus("error");
        return false;
      });

    const result = await activeSave;
    activeSave = null;
    return result && savedRevision < revision ? saveLatest() : result;
  }

  return {
    update(draft: T) {
      latestDraft = draft;
      revision += 1;
    },
    flush: saveLatest,
    hasUnsavedChanges: () => savedRevision < revision,
  };
}
