# Product requirements — Ajaia document workspace

## Purpose

Build a small, coherent collaborative-document product slice. It demonstrates document creation and browser editing, practical file ingestion, lightweight sharing, durable persistence, and engineering judgment. It is not a Google Docs clone.

## Users and assumptions

The app uses Firebase email/password authentication. A reviewer can create two accounts during evaluation, or the submitter may create two demo accounts in Firebase Authentication and list their credentials in `SUBMISSION.md`. This gives the product durable, real identities without spending time on custom authentication.

## MVP requirements

### Documents

- A signed-in user can create a blank document with a title.
- The owner can rename, edit, save, and reopen a document.
- The editor supports paragraphs, headings, bold, italic, underline, and bulleted lists.
- The document list visibly separates **My documents** from **Shared with me**.
- A saved document remains available after refresh.

### File import

- A user can import a `.txt` or `.md` file (maximum 1 MB) as a new editable document. The core import flow has been manually verified.
- The browser decodes UTF-8 text into a structured rich-text document.
- Unsupported types and oversized files produce clear errors.
- `.docx` is intentionally deferred and this limit must remain visible in the UI and README.

### Sharing

- A document has exactly one owner. The core sharing flow has been manually verified; final two-account verification must use the final deployed Rules.
- Its owner can share it with a registered user by email as a **viewer** or **editor**.
- Viewers can open but not modify a document; editors can modify it.
- The owner can change a role or remove a share.
- Firestore Security Rules enforce access independently of the UI.

### Reliability and usability

- Saving displays saving, saved, or failed state.
- Validation and Firebase errors are understandable and non-destructive.
- The primary flow is keyboard-accessible and works at common laptop widths.

## Acceptance flow

1. Sign in as the first user and create a document.
2. Apply rich-text formatting, save, refresh, and confirm content persists.
3. Import a valid text/Markdown file and confirm a separate editable document is created.
4. Share the first document with a second registered user as a viewer; switch user and confirm it is visible but cannot be edited.
5. Change the recipient to editor; confirm edits save.
6. Remove access; confirm the recipient no longer sees or can open the document.

## Explicit non-goals

- Real-time co-editing, cursor presence, comments, revision history, export, search, folders, and enterprise permissions.
- Rich `.docx` conversion and arbitrary binary attachment storage.
- Password recovery, email invitations, and account management.
