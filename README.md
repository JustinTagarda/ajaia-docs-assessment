# Ajaia document workspace

A deliberately scoped Firebase-backed document editor for the Ajaia AI-Native Full Stack Developer assignment.

## Stack

- React, TypeScript, Vite, TanStack Query, and Tiptap
- Firebase Authentication (email/password) and Cloud Firestore
- Firebase Hosting for the live demo
- Vitest for focused automated tests

## Local setup

1. Install Node.js 22+.
2. Create a Firebase project on the Spark (no-cost) plan. Enable **Email/Password** in Authentication and create a Cloud Firestore database in production mode.
3. Copy `apps/web/.env.example` to `apps/web/.env` and populate it with the Firebase web-app configuration.
4. Copy `.firebaserc.example` to `.firebaserc` and set its Firebase project ID.
5. Run `npm install` and `npm run firebase:login`.
6. With explicit approval, run `npm run firebase:deploy:rules` to publish the repository's Firestore rules for live development verification. Deploy checked-in composite indexes with `npm run firebase:deploy:indexes` when a feature requires them.
7. Run `npm run dev`.

The app runs at `http://localhost:5173`.

## Supported file import

Import a local UTF-8 `.txt` or `.md` file up to 1 MB to create a new editable document. Simple Markdown headings (`#`, `##`) and bulleted lines (`-` or `*`) become structured editor content; other text is kept as paragraphs. `.docx` and binary uploads are intentionally out of scope for this assessment slice.

## Sharing verification

Create two Email/Password accounts. As the owner, share a document with the second account as a viewer, confirm its read-only Shared with me view, upgrade it to editor and save an edit, then remove access and confirm the document disappears after the recipient refreshes or signs in again. Deploy the checked-in Firestore Rules with approval before this live check.

## Deploy to Firebase

After the documented two-user acceptance flow passes, run `npm run firebase:deploy`. This builds the web app and deploys Firebase Hosting plus the Firestore rules. For pre-deployment Firebase verification, use `npm run firebase:deploy:rules` only. Firebase configuration values in `VITE_*` variables are public web-app identifiers; no private server secret belongs in this repository.

## Project documentation

- [Product requirements](docs/requirements.md)
- [Technical architecture](docs/architecture.md)
- [Delivery and assessment notes](docs/delivery.md)

Consult the delivery note before preparing the final submission. Do not deploy Hosting until the documented two-user acceptance flow passes.
