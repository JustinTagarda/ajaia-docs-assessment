# Technical architecture

## Selected stack and rationale

| Concern | Choice | Why |
| --- | --- | --- |
| Web | React + TypeScript + Vite | Fast feedback and a focused product UI. |
| Editor | Tiptap / ProseMirror JSON | Accessible rich-text primitives and a structured persistence format. |
| Identity | Firebase Authentication | Email/password identities without a custom credential service. |
| Data | Cloud Firestore | Durable document/sharing data and no separate backend to deploy. |
| Client data | TanStack Query | Clear loading, mutation, invalidation, and save states. |
| Uploads | Browser File API | Parse small `.txt`/`.md` imports locally; no binary storage service needed. |
| Deployment | Firebase Hosting | One no-cost path for the live app and security rules. |
| Tests | Vitest | Fast unit/component coverage for the critical product logic. |

## Repository layout

```text
apps/web/            React/Vite interface
docs/                Scope, architecture, and delivery plan
firestore.rules      Server-enforced document authorization
firebase.json        Hosting and rules deployment configuration
```

## Data model

```text
User 1 ── owns ── * Document, with a recipient UID → role access map
```

- `users/{uid}`: `email`, `name`, `createdAt`
- `documents/{id}`: `title`, `content` (Tiptap JSON), `ownerId`, `ownerEmail`, `access` (UID → `viewer` | `editor`), `createdAt`, `updatedAt`

The owner lives only in `ownerId`; it is never duplicated in `access`. `ownerId`, `ownerEmail`, and `createdAt` are immutable. Documents always initialize `access` as an empty map, and timestamps use Firestore server timestamps.

## Client data contract

The React client uses the Firebase SDK directly. Firestore queries fetch owned documents by `ownerId` and shared documents by the current UID's entry in `access`; the UI presents those as distinct lists. The shared query has no Firestore `orderBy`, so the client sorts its small scoped result by server `updatedAt` rather than requiring an index for every dynamic UID map key. Mutations create documents, update title/content, and change the `access` map after resolving a registered user by normalized email. The app parses a local `.txt`/`.md` file into a Tiptap JSON document before creating it.

The owned-document list uses `ownerId ASC, updatedAt DESC`; its required composite index is versioned in `firestore.indexes.json` and must be deployed before the live query is exercised.

Authentication observes Firebase's session state and ensures each authenticated account has a `users/{uid}` profile. This bootstrap is idempotent so an existing user can sign in safely and a sign-up profile always retains the submitted display name.

## Security and reliability boundaries

- Validate client input with Zod and reject invalid roles, malformed share emails, unsupported extensions, empty files, and files larger than 1 MB.
- Firestore Security Rules bind profile and document-owner emails to the signed-in Firebase identity, resolve permission for every document operation, and recognize only `viewer` and `editor` access roles.
- Enforce a one-megabyte import limit and `.txt`/`.md` extension allow-list; decode only browser UTF-8 text. Markdown conversion intentionally supports only headings and bulleted lists; other source text stays as paragraphs.
- Constrain serialized Tiptap JSON below Firestore's 1 MiB document limit.
- Convert Firebase errors into safe, user-facing messages without exposing document content.

## Deployment shape

Firebase Hosting serves the single-page app and deploys `firestore.rules`. Configure the Firebase web-app values in the build environment, enable Email/Password authentication, and create two test accounts. Record the final hosted URL and credentials in `SUBMISSION.md` after verification.
