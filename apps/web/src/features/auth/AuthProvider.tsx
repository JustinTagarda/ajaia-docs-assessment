import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirebaseServices } from "../../lib/firebase";
import { firebaseAuthErrorMessage } from "./authValidation";
import { ensureUserProfile } from "./profile";
import type { SignInInput, SignUpInput, UserProfile } from "./types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  profileError: string | null;
  isLoading: boolean;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toUserFacingError(error: unknown): Error {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  return new Error(firebaseAuthErrorMessage(code));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth } = getFirebaseServices();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setIsLoading(true);
      setUser(nextUser);
      setProfileError(null);

      try {
        setProfile(nextUser ? await ensureUserProfile(nextUser) : null);
      } catch {
        setProfile(null);
        setProfileError(
          "Your account is signed in, but we could not load your workspace profile. Confirm that the Firestore Rules are deployed, then refresh.",
        );
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      profileError,
      isLoading,
      async signIn(input) {
        try {
          await signInWithEmailAndPassword(auth, input.email, input.password);
        } catch (error) {
          throw toUserFacingError(error);
        }
      },
      async signUp(input) {
        try {
          const credentials = await createUserWithEmailAndPassword(auth, input.email, input.password);
          await updateProfile(credentials.user, { displayName: input.name });
          await ensureUserProfile(credentials.user, input.name);
        } catch (error) {
          throw toUserFacingError(error);
        }
      },
      async signOut() {
        await firebaseSignOut(auth);
      },
    }),
    [auth, isLoading, profile, profileError, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
