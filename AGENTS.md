# Repository guide

Read the project documents before changing implementation:

- `docs/requirements.md` — approved scope, acceptance criteria, and non-goals.
- `docs/architecture.md` — stack, data model, API boundaries, and security choices.
- `docs/delivery.md` — test, deployment, walkthrough, and AI-workflow expectations.

Canonical assessment: `https://candidateassessments.ajaia.ai/attempt/S0l5ebSwfTmgPYrsNtYKm8TANXfIJpNq`. Verify scope against this page before making material product decisions; the local docs translate its current requirements into the approved MVP.

## Implementation order

1. Firebase initialization, session handling, and user-profile creation.
2. Firestore document types, queries, and ownership-safe mutations.
3. Dashboard and rich-text document editing with explicit save status.
4. Sharing, role-aware read-only behavior, and text/Markdown import.
5. Automated tests, two-user manual verification, deployment, and submission artifacts.

## Current delivery state

Stage 1 and Stage 2 are complete and live-verified. Stage 3's sharing and import flows have user-reported live verification; the second-pass Firestore Rules hardening is checked in locally and needs explicit approval before it is published. Preserve the existing Firebase module, auth/profile interfaces, and document repository; extend them rather than duplicating Firebase initialization, authentication state, or Firestore access. Do not mark Stage 3 fully complete until the documented two-account acceptance flow passes against the final deployed Rules.

## Development rules

- Use the `main` branch as the sole project branch. Do not create feature, release, or deployment branches unless the user explicitly changes this workflow.
- Commit coherent, reviewed changes before publishing; do not force-push or rewrite the public `main` history.
- Keep the implementation intentionally scoped to the documented MVP. Do not add stretch features before the core flows work end to end.
- Use strict TypeScript. Avoid `any`; validate all user-controlled data at the client/data boundary.
- Keep client state Firestore-backed. Treat rich-text document JSON as untrusted input and validate its shape/size before persistence.
- Enforce authorization in Firestore Security Rules, never only in the UI. A user can read or edit only documents they own or that are explicitly shared with them.
- Keep `ownerId`, `ownerEmail`, and `createdAt` immutable after document creation. Every document must include an `access` map, even when empty.
- Normalize sharing emails with `trim().toLowerCase()` and share only with an existing profile; never use a raw email address as an access-map key.
- Use Firebase server timestamps for created/updated values. Do not rely on browser time for document ordering.
- An editor may change only `title`, `content`, and `updatedAt`; only the owner may change sharing data or delete the document.
- Preserve the distinction between owned and shared documents in all list and detail views.
- Make file upload constraints visible in the UI and README; do not silently accept unsupported files.
- Keep rich-text data as Tiptap JSON—not HTML—and cap its serialized size below Firestore's 1 MiB document limit.
- For Stage 2, build document writes through a single typed repository module and keep the dashboard list/detail UI free of direct Firestore calls.
- The owned-document query depends on the checked-in `ownerId ASC, updatedAt DESC` index. Deploy index changes before live verification; do not workaround an index error by removing ordered persistence behavior.
- Add or update focused tests for import conversion/validation and viewer-versus-editor behavior. Manually verify Firestore Rules with two accounts whenever they change.
- Do not commit private credentials, `.env` files, or build outputs. Firebase web configuration is public but stays in the local environment file to keep deployments configurable.

## Commands

- Install: `npm install`
- Develop all apps: `npm run dev`
- Test: `npm test`
- Lint: `npm run lint`
- Deploy Firestore Rules only: `npm run firebase:deploy:rules`
- Deploy Firestore indexes only: `npm run firebase:deploy:indexes`

With explicit user approval, deploy Firestore Rules only before live Firebase verification. Do not deploy Hosting, edit the live assessment, or submit materials until the documented two-user acceptance flow passes. Do not add a server, Cloud Function, a second hosting provider, or an optional stretch feature unless the core acceptance flow is working and the user asks for it.

Use the root workspace scripts. Deploy final Hosting and Rules via `npm run firebase:deploy` only when the user authorizes publishing.
