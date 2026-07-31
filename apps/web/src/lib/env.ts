import { z } from "zod";

const firebaseEnvironmentSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  VITE_FIREBASE_APP_ID: z.string().min(1),
});

export type FirebaseEnvironment = z.infer<typeof firebaseEnvironmentSchema>;

export class FirebaseConfigurationError extends Error {
  constructor() {
    super(
      "Firebase is not configured. Copy apps/web/.env.example to apps/web/.env and add your Firebase web app values.",
    );
    this.name = "FirebaseConfigurationError";
  }
}

export function readFirebaseEnvironment(environment: unknown): FirebaseEnvironment {
  const result = firebaseEnvironmentSchema.safeParse(environment);

  if (!result.success) {
    throw new FirebaseConfigurationError();
  }

  return result.data;
}
