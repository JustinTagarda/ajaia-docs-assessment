import { AuthScreen } from "./features/auth/AuthScreen";
import { AuthProvider, useAuth } from "./features/auth/AuthProvider";
import { DocumentWorkspace } from "./features/documents/DocumentWorkspace";

function Workspace() {
  const { isLoading, profile, profileError, signOut } = useAuth();

  if (isLoading) {
    return <main className="centered-message">Restoring your workspace…</main>;
  }

  if (!profile) {
    if (profileError) {
      return (
        <main className="setup-layout">
          <section className="setup-card">
            <p className="eyebrow">Ajaia Docs</p>
            <h1>Workspace setup needed</h1>
            <p>{profileError}</p>
            <button onClick={() => window.location.reload()}>Refresh app</button>
            <button className="text-button sign-out-link" onClick={() => void signOut()}>Sign out</button>
          </section>
        </main>
      );
    }
    return <AuthScreen />;
  }

  return (
    <main className="workspace-layout">
      <header className="workspace-header">
        <div><p className="eyebrow">Ajaia Docs</p><h1>Documents</h1></div>
        <div className="account"><span>{profile.name}</span><button className="secondary-button" onClick={() => void signOut()}>Sign out</button></div>
      </header>
      <DocumentWorkspace profile={profile} />
    </main>
  );
}

export default function App() {
  return <AuthProvider><Workspace /></AuthProvider>;
}
