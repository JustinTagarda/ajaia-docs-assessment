# Delivery plan and assessment notes

## Current progress

**Stage 1 complete and live-verified:** Firebase environment validation, Email/Password authentication, Firestore profile bootstrap, session restoration, protected workspace shell, Firestore Rules deployment, and focused auth-validation tests.

**Stage 2 complete and live-verified:** Typed document persistence, document list/create/open/rename/save, required Tiptap formatting, validation, serialized autosave, refresh/reopen persistence, and newest-updated ordering are working against Firestore. The Stage 2 composite index is deployed.

**Stage 3 implementation complete; core manual verification reported:** local `.txt`/`.md` import (up to 1 MB) and sharing have been exercised against Firebase. The second-pass Rules hardening is checked in locally and must be deployed with approval before the final two-account acceptance flow marks the stage complete.

**Stage 4 pending — delivery verification:** deploy the final Rules hardening, repeat the two-account acceptance flow, publish Firebase Hosting, and complete the reviewer artifacts. This stage changes deployment and submission state; it does not add product features.

The public GitHub repository uses `main` as its sole project branch. Keep its history linear and do not add environment-specific credentials, build output, or reviewer passwords.

## Priority order

1. Persisted document create/edit/reopen flow with a usable rich-text toolbar.
2. Firestore-rule-enforced sharing and clear owned/shared lists.
3. Text/Markdown import with validation and errors.
4. Stage 4: final Rules deployment, two-account verification, Firebase Hosting, walkthrough, and submission materials.

## Verification checklist

- With explicit approval, deploy the updated Firestore Rules before live Firebase checks.
- Run tests, lint, and a production build before submission.
- Confirm the deployed Firestore Rules prevent a viewer from writing and prevent an unshared user from reading through a direct URL.
- Manually follow the acceptance flow in `docs/requirements.md` using two Firebase test users.
- Test refresh, denied access after unsharing, invalid upload, and save failure messaging.
- Verify Firebase Authentication, Firestore Rules, and the hosted SPA deployment before recording the walkthrough.

## Deployment sequence

1. Use `npm run firebase:deploy:rules` or `npm run firebase:deploy:indexes` only after explicit approval to publish the respective Firebase configuration for live verification. Stage 3 introduces no new index.
2. Do not publish Firebase Hosting while core implementation remains incomplete.
3. After the two-user acceptance flow passes locally, run `npm run firebase:deploy` with explicit approval to deploy both the built SPA and rules.

## AI-native workflow note template

Complete this truthfully at submission time. Do not claim work that was not performed.

```md
## AI-native workflow

- Tools used: [tool names and purpose]
- Material acceleration: [where the tools sped up planning, scaffolding, implementation, or testing]
- Decisions reviewed/rejected: [examples where generated output was changed or declined]
- Verification: [tests, manual flows, code review, and UX checks performed]
```

## Walkthrough video outline (3–5 minutes)

1. State the product slice and intentional non-goals.
2. Sign in, create, format, save, refresh, and reopen a document.
3. Import a text/Markdown file.
4. Share with the second test user; demonstrate viewer then editor behavior.
5. Show owned versus shared lists, Firebase deployment, tests, and key architecture choices.
6. Close with trade-offs and what two to four more hours would add.

## Submission preparation

Use the root `SUBMISSION.md` as the final exact-materials list. Add the Firebase Hosting URL, public walkthrough URL, Google Drive source folder, two reviewer accounts, verified scope, and any honest limitations. Put the video URL in `VIDEO_URL.txt` before handoff.
