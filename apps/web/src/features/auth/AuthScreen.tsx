import { useState, type FormEvent } from "react";
import { signInSchema, signUpSchema } from "./authValidation";
import { useAuth } from "./AuthProvider";

type Mode = "sign-in" | "sign-up";

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const values = {
      name: String(fields.get("name") ?? ""),
      email: String(fields.get("email") ?? ""),
      password: String(fields.get("password") ?? ""),
    };
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "sign-in") {
        const result = signInSchema.safeParse(values);
        if (!result.success) {
          setError(result.error.issues[0]?.message ?? "Check the form and try again.");
          return;
        }
        await signIn(result.data);
      } else {
        const result = signUpSchema.safeParse(values);
        if (!result.success) {
          setError(result.error.issues[0]?.message ?? "Check the form and try again.");
          return;
        }
        await signUp(result.data);
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSignUp = mode === "sign-up";

  return (
    <main className="auth-layout">
      <section className="auth-panel" aria-labelledby="auth-title">
        <p className="eyebrow">Ajaia Docs</p>
        <h1 id="auth-title">{isSignUp ? "Create your workspace" : "Welcome back"}</h1>
        <p className="muted">{isSignUp ? "Create an account to start writing and sharing." : "Sign in to continue to your documents."}</p>

        <form onSubmit={submit} className="auth-form" noValidate>
          {isSignUp && (
            <label>
              Name
              <input name="name" autoComplete="name" required maxLength={80} />
            </label>
          )}
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} required minLength={8} />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}</button>
        </form>

        <p className="switch-auth">
          {isSignUp ? "Already have an account?" : "New to Ajaia Docs?"}{" "}
          <button type="button" className="text-button" onClick={() => { setMode(isSignUp ? "sign-in" : "sign-up"); setError(null); }}>
            {isSignUp ? "Sign in" : "Create an account"}
          </button>
        </p>
      </section>
    </main>
  );
}
