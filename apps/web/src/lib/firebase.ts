import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { readFirebaseEnvironment } from "./env";

let services: ReturnType<typeof createFirebaseServices> | undefined;

function createFirebaseServices() {
  const environment = readFirebaseEnvironment(import.meta.env);
  const app = getApps().length === 0
    ? initializeApp({
        apiKey: environment.VITE_FIREBASE_API_KEY,
        authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: environment.VITE_FIREBASE_PROJECT_ID,
        storageBucket: environment.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: environment.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: environment.VITE_FIREBASE_APP_ID,
      })
    : getApp();

  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };
}

export function getFirebaseServices() {
  services ??= createFirebaseServices();
  return services;
}
