# Delivery plan and assessment notes

## Current progress

**Stage 1 complete and live-verified:** Firebase environment validation, Email/Password authentication, Firestore profile bootstrap, session restoration, protected workspace shell, Firestore Rules deployment, and focused auth-validation tests.

**Stage 2 complete and live-verified:** Typed document persistence, document list/create/open/rename/save, required Tiptap formatting, validation, serialized autosave, refresh/reopen persistence, and newest-updated ordering are working against Firestore. The Stage 2 composite index is deployed.

**Stage 3 implementation complete; core manual verification reported:** local `.txt`/`.md` import (up to 1 MB) and sharing have been exercised against Firebase. The second-pass Rules hardening is checked in locally and must be deployed with approval before the final two-account acceptance flow marks the stage complete.

**Stage 4 deployment and acceptance verification complete:** the final Rules hardening was deployed, the two-account acceptance flow passed, and Firebase Hosting was published at [ajaia-docs-assessment.web.app](https://ajaia-docs-assessment.web.app). Remaining submission work is administrative: add the public walkthrough and Google Drive links through the authorized submission channel.

The public GitHub repository uses `main` as its sole project branch. Keep its history linear and do not add environment-specific credentials, build output, or reviewer passwords.

## Priority order

1. Persisted document create/edit/reopen flow with a usable rich-text toolbar.
2. Firestore-rule-enforced sharing and clear owned/shared lists.
3. Text/Markdown import with validation and errors.
4. Stage 4: final Rules deployment, two-account verification, Firebase Hosting, walkthrough, and submission materials.

## Verification checklist

- The final Firestore Rules were deployed successfully.
- Tests, lint, production build, and dependency audit passed before deployment.
- Confirm the deployed Firestore Rules prevent a viewer from writing and prevent an unshared user from reading through a direct URL.
- Manually follow the acceptance flow in `docs/requirements.md` using two Firebase test users.
- Test refresh, denied access after unsharing, invalid upload, and save failure messaging.
- Firebase Authentication, Firestore Rules, and the hosted SPA deployment were verified before recording the walkthrough.

## Deployment sequence

1. Final Firestore Rules were deployed after explicit approval.
2. The two-account acceptance flow passed against the deployed Rules.
3. `npm run firebase:deploy` then published Firebase Hosting and the current Firebase configuration.

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
