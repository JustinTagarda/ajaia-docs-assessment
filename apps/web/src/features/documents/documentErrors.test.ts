import { describe, expect, it } from "vitest";
import { documentLoadErrorMessage } from "./documentErrors";

describe("document load errors", () => {
  it("returns actionable messages for known Firestore errors", () => {
    expect(documentLoadErrorMessage({ code: "failed-precondition" })).toContain("index");
    expect(documentLoadErrorMessage({ code: "permission-denied" })).toContain("Rules");
  });
});
