# Build Plan

## Core Principle

Build the product phase by phase, with each phase producing something visible and testable.

Each phase should include both UI and backend logic where possible. Avoid building too many invisible backend pieces without a usable screen. Keep the implementation practical, clean, and focused on the assessment requirements.

The project foundation and database migration/seed setup are handled separately and are not included in this build plan.

---

## Phase 1 — Auth

### Goal

Build creator authentication using signup, login, logout, and HTTP-only cookie based JWT authentication.

This phase creates the base identity system needed for tenant isolation.

### Modules Included

- `auth`
- auth middleware
- cookie handling
- protected route base

### UI

- Signup page
- Login page

### Backend

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Requirements

- Signup creates a creator and an admin user.
- Login validates email and password.
- JWT must be stored in an HTTP-only cookie.
- Do not use `localStorage` or `sessionStorage` for JWT.
- Logout clears the auth cookie.
- Protected backend routes must read the user from the cookie.
- JWT payload must include `userId`, `creatorId`, and `email`.

### Done When

- A creator can sign up.
- A creator can log in.
- Auth cookie is set after login.
- Auth cookie is cleared after logout.
- `/auth/me` returns the logged-in user.
- Protected routes reject unauthenticated requests.

---

## Phase 2 — Programs

### Goal

Build program management for creators.

Creators should be able to view, create, update, and delete their own programs.

### Modules Included

- `programs`
- `audit`

### UI

- Programs page
- Add Program modal
- Edit Program modal

### Backend

- `GET /programs`
- `POST /programs`
- `GET /programs/:programId`
- `PATCH /programs/:programId`
- `DELETE /programs/:programId`

### Requirements

- Every program must belong to the logged-in creator.
- Program queries must be scoped by `creatorId`.
- The frontend must not send `creatorId`.
- The backend must get `creatorId` from the authenticated cookie.
- Cross-tenant access must return `404`.
- Program create/update/delete actions must create audit logs.

### Done When

- Creator can see only their own programs.
- Creator can add a program using a modal.
- Creator can edit a program using a modal.
- Creator can delete a program.
- Program write actions are saved in audit logs.
- Cross-tenant program access is blocked.

---

## Phase 3 — Program Detail + Sessions

### Goal

Build the main program workspace.

The Program Detail Page should show program information and all sessions inside that program. Sessions can be created and edited from the same page.

### Modules Included

- `programs`
- `sessions`
- `audit`

### UI

- Program Detail Page
- Add Session modal
- Edit Session modal
- Session list

### Backend

- `GET /programs/:programId`
- `GET /programs/:programId/sessions`
- `POST /programs/:programId/sessions`
- `PATCH /sessions/:sessionId`
- `DELETE /sessions/:sessionId`

### Requirements

- Program Detail Page shows:
  - program title
  - program description
  - total sessions
  - total duration
  - sessions list
  - edit program button
  - bulk import button
  - add session button

- Sessions must belong to both `programId` and `creatorId`.
- Session queries must be scoped by `creatorId`.
- Session create/update/delete actions must create audit logs.
- Session media fields should support audio/video metadata.
- Actual S3 upload flow is handled in a later phase.

### Done When

- Creator can open a program detail page.
- Creator can see sessions inside that program.
- Creator can add a session using a modal.
- Creator can edit a session using a modal.
- Creator can delete a session.
- Creator cannot access another creator’s sessions.
- Session write actions are saved in audit logs.

---

## Phase 4 — Session Reorder

### Goal

Allow creators to reorder sessions inside a program.

This phase handles ordered session position updates safely.

### Modules Included

- `sessions`
- `audit`

### UI

- Drag/reorder control in the session list

### Backend

- `POST /programs/:programId/sessions/reorder`

### Requirements

- Frontend sends ordered session IDs.
- Backend verifies the program belongs to the logged-in creator.
- Backend verifies all session IDs belong to the same creator and program.
- Positions must be updated in a database transaction.
- Reorder action must create an audit log.
- Cross-tenant session IDs must be rejected.

### Done When

- Creator can reorder sessions in the Program Detail Page.
- New order persists after refresh.
- Invalid or cross-tenant session IDs are rejected.
- Reorder action is saved in audit logs.

---

## Phase 5 — CSV Import

### Goal

Allow creators to bulk import sessions into a program using a CSV file.

The CSV import should be opened from the Program Detail Page using the Bulk Import button.

### Modules Included

- `imports`
- `sessions`
- `audit`

### UI

- Import CSV modal

### Backend

- `POST /programs/:programId/sessions/import`

### CSV Columns

Required:

- `title`
- `duration`

Optional:

- `position`
- `instructorName`
- `tags`
- `mediaType`
- `mediaUrl`

### Requirements

- Import modal shows expected CSV format.
- Import modal allows selecting or dragging a `.csv` file.
- Backend parses the uploaded CSV.
- Backend validates each row.
- Valid rows are inserted.
- Invalid rows are returned with row-level validation errors.
- Partial import is allowed.
- Import request must include `clientImportId`.
- Same `creatorId + clientImportId` must not duplicate sessions.
- Import action must create an audit log.

### Done When

- Creator can upload a CSV from the Program Detail Page.
- Valid sessions are created.
- Invalid rows are shown clearly in the modal.
- Retrying the same import does not duplicate sessions.
- Import action is saved in audit logs.

---

## Phase 6 — S3 Uploads

### Goal

Build secure media upload using S3 pre-signed URLs.

Media upload should be used from the Add/Edit Session modal.

### Modules Included

- `uploads`
- `sessions`
- `audit`

### UI

- Session media upload field inside Add/Edit Session modal

### Backend

- `POST /uploads/presign`

### Requirements

- Frontend requests a pre-signed URL before uploading media.
- Backend verifies the logged-in creator.
- Backend creates a tenant-scoped S3 key.
- S3 key must include `creatorId`.
- Pre-signed URL must be short-lived.
- Only allowed media types should be accepted.
- Frontend uploads file directly to S3.
- Uploaded media URL is saved in the session form.
- Upload URL request should create an audit log.

### S3 Key Pattern

```txt
creators/{creatorId}/sessions/{uuid}.{extension}
```

### Done When

- Creator can upload media from the session modal.
- File is uploaded directly to S3.
- Session stores the media URL.
- S3 key is tenant-scoped.
- Upload URL request is saved in audit logs.

---

## Phase 7 — Audit Logs

### Goal

Build creator-facing audit log viewer.

Creators should be able to see their own admin actions and filter them.

### Modules Included

- `audit`

### UI

- Audit Logs page

### Backend

- `GET /audit-logs`

### Requirements

- Creator can view audit logs.
- Logs are scoped by `creatorId`.
- Creator cannot view another creator’s audit logs.
- Page supports filters:
  - date range
  - action type

- Logs should show readable action details.

### Done When

- Audit Logs page shows creator’s own activity.
- Date filter works.
- Action type filter works.
- Cross-tenant audit log access is blocked.

---

## Phase 8 — Tests and Quality Pass

### Goal

Add tests and review the system against the assessment quality bars.

This phase proves the important backend guarantees.

### Modules Included

- tests
- logging
- tenant isolation
- import idempotency
- upload security

### Backend Tests

Required test cases:

- `rejects cross-tenant program access`
- `rejects cross-tenant session access`
- `rejects cross-tenant audit log access`
- `does not duplicate sessions for repeated clientImportId`
- `creates tenant-scoped presigned upload key`

### Quality Checks

- All tenant-owned queries include `creatorId`.
- JWT is stored only in HTTP-only cookies.
- No JWT in `localStorage` or `sessionStorage`.
- Request bodies are validated.
- Passwords are hashed.
- Server logs are structured JSON.
- Logs include `request_id` and `tenant_id`.
- Prisma migrations exist.
- Seed script exists.
- No manual database changes outside migrations.

### Done When

- Required tests pass.
- Tenant isolation is verified.
- Import idempotency is verified.
- Upload key tenant scoping is verified.
- Logging requirements are checked.
- No obvious security gaps remain.

---

## Phase 9 — Submission Docs

### Goal

Prepare the required assessment deliverables.

### Modules Included

- docs
- ai-history
- README
- Loom walkthrough

### Required Deliverables

- Public GitHub repo
- README.md
- `.env.example`
- `docs/CODE_SUMMARY.md`
- `docs/ARCHITECTURE_REVIEW.md`
- `/ai-history` folder
- Loom walkthrough link

### README Must Include

- project overview
- setup instructions
- run instructions
- test instructions
- seed instructions
- Loom link at the top

### CODE_SUMMARY.md Must Include

Module-by-module summary:

- `auth`
- `programs`
- `sessions`
- `imports`
- `uploads`
- `audit`

### ARCHITECTURE_REVIEW.md Must Include

- what was built and skipped
- tenant isolation strategy
- bulk import design
- S3 upload flow
- parts not fully confident in
- what would change with two more days

### Done When

- Repo is ready for review.
- README is complete.
- Required docs are complete.
- AI history is added.
- Loom walkthrough is recorded and linked.
