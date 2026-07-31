import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseServices } from "../../lib/firebase";
import type { UserProfile } from "./types";

function profileFromData(user: User, data: Record<string, unknown>): UserProfile {
  return {
    uid: user.uid,
    email: typeof data.email === "string" ? data.email : user.email?.trim().toLowerCase() ?? "",
    name: typeof data.name === "string" ? data.name : user.displayName?.trim() || user.email?.split("@")[0] || "Member",
    createdAt: (data.createdAt as UserProfile["createdAt"]) ?? null,
  };
}

function profileName(user: User, preferredName?: string): string {
  return preferredName?.trim() || user.displayName?.trim() || user.email?.split("@")[0] || "Member";
}

export async function ensureUserProfile(user: User, preferredName?: string): Promise<UserProfile> {
  const { db } = getFirebaseServices();
  const reference = doc(db, "users", user.uid);
  const snapshot = await getDoc(reference);

  if (snapshot.exists()) {
    const profile = profileFromData(user, snapshot.data());
    const name = profileName(user, preferredName);

    if (preferredName && profile.name !== name) {
      await setDoc(reference, { name }, { merge: true });
      return { ...profile, name };
    }

    return profile;
  }

  const profile = {
    email: user.email?.trim().toLowerCase() ?? "",
    name: profileName(user, preferredName),
    createdAt: serverTimestamp(),
  };

  await setDoc(reference, profile);
  return { uid: user.uid, ...profile, createdAt: null };
}
