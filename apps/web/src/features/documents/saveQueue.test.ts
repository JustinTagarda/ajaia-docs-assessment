import { describe, expect, it, vi } from "vitest";
import { createSerializedSaveQueue } from "./saveQueue";

describe("serialized save queue", () => {
  it("writes a newer draft only after the active write completes", async () => {
    const resolvers: Array<() => void> = [];
    const save = vi.fn(() => new Promise<void>((resolve) => resolvers.push(resolve)));
    const statuses: string[] = [];
    const queue = createSerializedSaveQueue(save, (status) => statuses.push(status));

    queue.update("first draft");
    const completed = queue.flush();
    queue.update("second draft");
    const latestCompleted = queue.flush();
    expect(save).toHaveBeenCalledWith("first draft");

    resolvers[0]!();
    await vi.waitFor(() => expect(save).toHaveBeenCalledWith("second draft"));

    resolvers[1]!();
    await expect(completed).resolves.toBe(true);
    await expect(latestCompleted).resolves.toBe(true);
    expect(statuses).toEqual(["saving", "saved", "saving", "saved"]);
    expect(queue.hasUnsavedChanges()).toBe(false);
  });

  it("keeps the draft retryable after a failed save", async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined);
    const queue = createSerializedSaveQueue(save, vi.fn());
    queue.update("draft");

    await expect(queue.flush()).resolves.toBe(false);
    expect(queue.hasUnsavedChanges()).toBe(true);
    await expect(queue.flush()).resolves.toBe(true);
  });
});
