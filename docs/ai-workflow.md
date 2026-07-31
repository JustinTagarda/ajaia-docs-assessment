# AI-native workflow note

> This note records the implementation work completed so far. Update the final deployment and walkthrough items truthfully before submission.

## Tools used

- Codex: assessment analysis, technology selection, repository scaffolding, implementation assistance, documentation, code review, and local verification support.
- Firebase CLI: Firestore Rules compilation and deployment.
- Firebase Authentication and Firestore: live identity, persistence, and two-account feature checks.

## Material acceleration

Codex accelerated conversion of the assessment into an intentionally scoped MVP, a Firebase-ready repository structure, and documented acceptance criteria. It also assisted with typed Firestore repository boundaries, rich-text persistence, serialized saving, import validation, access-role behavior, and focused tests.

## Decisions reviewed or rejected

The initial Express/PostgreSQL architecture was rejected before feature work because it adds deployment and operational complexity without improving this time-boxed product slice. Firebase Authentication, Firestore, and Hosting provide durable identity, sharing data, security rules, and a single deployment path on the no-cost plan.

The implementation intentionally rejected a custom API/server, Cloud Functions, binary storage, `.docx` conversion, real-time collaboration, and optional stretch features. This kept the deployed surface to Firebase Authentication, Firestore, and Hosting while covering the assignment's core document, sharing, file-import, and persistence requirements.

## Verification

- The source assessment was reviewed directly on 2026-07-31.
- TypeScript lint, 15 focused Vitest tests, a production build, Firebase configuration validation, and dependency audit were run after implementation.
- Firestore Rules were compiled and deployed for the initial two-account sharing verification.
- Manual Firebase checks confirmed sharing and a successful text/Markdown import.
- The final Rules hardening was deployed; the complete two-account acceptance flow passed; Firebase Hosting was published at `https://ajaia-docs-assessment.web.app`.
- Remaining truthful submission item: record the public walkthrough URL after it is created.
