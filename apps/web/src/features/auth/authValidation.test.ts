import { describe, expect, it } from "vitest";
import { firebaseAuthErrorMessage, signInSchema, signUpSchema } from "./authValidation";

describe("authentication validation", () => {
  it("normalizes a valid registration email", () => {
    const result = signUpSchema.parse({ name: "Maya Chen", email: " MAYA@EXAMPLE.COM ", password: "password1" });
    expect(result.email).toBe("maya@example.com");
  });

  it("requires a full registration payload", () => {
    expect(signUpSchema.safeParse({ name: "M", email: "invalid", password: "short" }).success).toBe(false);
    expect(signInSchema.safeParse({ email: "maya@example.com", password: "" }).success).toBe(false);
  });

  it("does not expose raw Firebase authentication errors", () => {
    expect(firebaseAuthErrorMessage("auth/invalid-credential")).toBe("The email or password is incorrect.");
    expect(firebaseAuthErrorMessage("unexpected")).toBe("We could not complete that request. Please try again.");
  });
});
