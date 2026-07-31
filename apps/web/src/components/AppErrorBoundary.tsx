import { Component, type ErrorInfo, type ReactNode } from "react";
import { FirebaseConfigurationError } from "../lib/env";

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {}

  render() {
    if (this.state.error) {
      const isFirebaseConfigurationError = this.state.error instanceof FirebaseConfigurationError;
      return (
        <main className="setup-layout">
          <section className="setup-card">
            <p className="eyebrow">Ajaia Docs</p>
            <h1>{isFirebaseConfigurationError ? "Firebase setup required" : "Unable to start the app"}</h1>
            <p>{this.state.error.message}</p>
            {isFirebaseConfigurationError && <code>apps/web/.env</code>}
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
