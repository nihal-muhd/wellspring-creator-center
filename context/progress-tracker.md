# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately understand what is done, what is in progress, and what is next.

---

## Current Status

**Current Phase:** Phase 5 — CSV Import
**Last completed:** CSV import API, row-level feedback, idempotency, and audit logging
**Next:** Phase 6 — S3 Uploads

---

## Progress

### Phase 1 — Auth

- [x] 01 Signup page
- [x] 02 Signup API
- [x] 03 Login page
- [x] 04 Login API
- [x] 05 Auth me API
- [x] 06 Protected frontend route handling

### Phase 2 — Programs

- [x] 07 Programs page
- [x] 08 Add Program modal
- [x] 09 Edit Program modal
- [x] 10 Program CRUD APIs
- [ ] 11 Program image upload connection - Skip for now
- [x] 12 Program audit logs

### Phase 3 — Program Detail + Sessions

- [x] 13 Program Detail page
- [x] 14 Session list UI
- [x] 15 Add Session modal
- [x] 16 Edit Session modal
- [x] 17 Session CRUD APIs
- [ ] 18 Session media upload connection - Skip for now
- [x] 19 Session audit logs

### Phase 4 — Session Reorder

- [x] 20 Drag-and-drop session reorder UI
- [x] 21 Reorder API
- [x] 22 Save reordered positions
- [x] 23 Reorder audit log

### Phase 5 — CSV Import

- [x] 24 CSV Import modal
- [x] 25 CSV import API
- [x] 26 Row-level validation feedback
- [x] 27 Idempotent import handling
- [x] 28 Import audit log

### Phase 6 — S3 Uploads

- [ ] 29 S3 presigned upload API
- [ ] 30 Program image upload flow
- [ ] 31 Session media upload flow
- [ ] 32 Save file URL and S3 key
- [ ] 33 Delete old S3 files on replace/remove

### Phase 7 — Audit Logs

- [ ] 34 Audit Logs page
- [ ] 35 Audit log filters
- [ ] 36 Audit log API

### Phase 8 — Tests and Quality Pass

- [ ] 37 Tenant isolation tests
- [ ] 38 CSV import idempotency test
- [ ] 39 S3 upload key security test
- [ ] 40 Auth cookie check
- [ ] 41 Structured logging check

---

## Notes

- Tailwind v4 is configured through `frontend/app/globals.css` using CSS-first `@theme` tokens.
- Plus Jakarta Sans is connected through `next/font/google` and the `font-sans` utility.
- Signup frontend uses reusable layers: auth components, shared auth types, validation/API helpers, and a state orchestration hook.
- Signup and login share `AuthLayout`; both forms use the same input, action, validation, loading, and request-error patterns.
- Login API validates normalized credentials, returns a generic `401` for invalid credentials, and sets the 7-day HTTP-only `access_token` cookie.
- Auth middleware reads and verifies the `access_token` cookie, attaches typed identity to the request, and returns generic `401` responses for missing or invalid tokens.
- Auth me API revalidates both `userId` and `creatorId` against the database before returning safe user and creator details.
- Next.js `proxy.ts` performs an optimistic cookie-presence check for protected routes, while the `(protected)` server layout securely validates the session through `/auth/me`.
- Protected redirects preserve a safe local `returnTo` path so login can return users to their requested workspace page.
- Login and signup replace the auth history entry after success, and the `(public-auth)` server layout redirects already-authenticated users away from `/login` and `/signup`.
- Protected pages now share a responsive workspace sidebar with authenticated creator branding, active Programs/Audit Logs navigation, and functional cookie-based logout.
- Programs page now matches the dashboard reference with a responsive search toolbar, page header, New Program action, program-card grid, and empty search state; pagination is intentionally omitted.
- Add and edit use one accessible Program Form modal with title validation, optional description, local image selection/preview, keyboard focus containment, and responsive scrolling.
- Program CRUD API now provides authenticated list, create, detail, update, and delete endpoints under `/programs`.
- Every Program repository query is tenant-scoped with `creatorId`; cross-tenant detail, update, and delete operations return `404`.
- Program API validates request bodies and route parameters with Zod and returns session counts through `_count.sessions`.
- Programs UI now loads real tenant programs and connects create, update, and delete actions to the API with loading skeletons, retry, empty, submitting, and request-error states.
- API session expiry redirects the Programs UI to login; local image selections remain preview-only and are not sent as data URLs.
- Program delete currently uses the browser confirmation prompt; a custom confirmation dialog can replace it during a later UI polish pass.
- Program create, update, and delete now write `PROGRAM_CREATED`, `PROGRAM_UPDATED`, and `PROGRAM_DELETED` audit records.
- Program mutations and their audit records run in one Prisma transaction so they succeed or roll back together.
- Audit identity comes from the verified JWT (`creatorId` and `userId`); cross-tenant misses return `404` without creating audit records.
- Program update audit metadata stores changed fields with previous/new values, while delete metadata preserves final program details and session count.
- Program cards now link to a responsive Program Detail page with program editing, session totals, total duration, media filtering, loading, empty, and request-error states.
- Session list reads from `GET /programs/:programId/sessions`; program ownership and every session query are scoped by authenticated `creatorId`.
- Add and edit sessions share one accessible Session Form modal with decimal-hour duration input, conversion to integer minutes, instructor details, removable tags, and local audio/video preview.
- Session create uses `POST /programs/:programId/sessions`, assigns the next position inside a transaction, and writes a `SESSION_CREATED` audit record.
- Session update uses `PATCH /sessions/:sessionId`, scopes lookup and update by `creatorId`, preserves program ownership, and writes a `SESSION_UPDATED` audit record with changed fields.
- Session media file selection is preview-only until the S3 phase; selected local files are never sent as data URLs or stored as permanent media.
- Session delete uses `DELETE /sessions/:sessionId`, scopes lookup and deletion by `creatorId`, returns `404` for cross-tenant misses, and writes `SESSION_DELETED` in the same transaction.
- Session cards expose compact edit/delete actions; delete uses confirmation, pending/disabled state, human-readable request errors, and immediately updates session count and total duration after success.
- Session reorder uses dnd-kit with dedicated pointer and keyboard-accessible drag handles inside the existing session card pattern.
- Reorder applies an optimistic local order, renumbers visible positions from `1`, disables conflicting row actions while saving, and restores the previous order with a human-readable error if persistence fails.
- `POST /programs/:programId/sessions/reorder` accepts the complete ordered session ID list and rejects duplicate, missing, foreign-program, or cross-tenant IDs.
- Backend reorder verifies program ownership, updates every position, and writes one `SESSION_REORDERED` audit record in the same Prisma transaction.
- Phase 4 verification passed backend TypeScript build, frontend ESLint, frontend standalone TypeScript checking, and `git diff --check`. The full Next.js build remains blocked locally by an external Windows file lock on `frontend/.next/trace`.
- The Program Detail Bulk Import action now opens an accessible CSV import modal matching the supplied reference and existing workspace modal patterns.
- The CSV modal documents required and optional columns, shows sample data, accepts click-selected `.csv` files up to 10 MB, and provides selected-file Change/Remove controls.
- CSV modal proportions were refined to a compact `max-w-2xl` shell with tighter section spacing and a shorter file-picker area for comfortable laptop viewport fit.
- The initial CSV modal shell passed frontend ESLint, standalone TypeScript checking, and `git diff --check` before API integration.
- CSV import now posts multipart form data to `POST /programs/:programId/sessions/import` with a stable `clientImportId` and a route-scoped Multer memory upload limited to one `.csv` file under 10 MB.
- The backend parses CSV with `csv-parse`, requires `title` and `duration`, accepts the documented optional columns, converts decimal duration hours to whole minutes, and returns visible CSV line numbers with field-level validation messages.
- Valid rows are partially imported even when other rows fail; optional CSV positions order only the valid imported batch, which is appended after existing sessions with sequential persisted positions.
- Import persistence verifies tenant-owned program access and transactionally creates valid sessions, the `BulkImport` result, and one `BULK_IMPORT_CREATED` audit record.
- Reusing the same creator-scoped `clientImportId` returns the stored result with `idempotentReplay: true` and does not create sessions or another audit record.
- The import modal now shows request errors, imported/failed row counts, idempotent replay status, and a scrollable row-error list, then refreshes the Program Detail session list and totals.
- After a successful import response, the modal hides the Import Sessions action and leaves only Close, preventing accidental duplicate API calls from the completed state.
- CSV import verification passed backend TypeScript build, frontend ESLint, frontend standalone TypeScript checking, parser line-number inspection, and `git diff --check`.
- Prioritize frontend first inside each phase.
- Tenant isolation is the highest priority.
- Every tenant-owned backend query must include `creatorId`.
- JWT must stay in HTTP-only cookie only.
- Do not store JWT in `localStorage` or `sessionStorage`.
- Prisma migration files must be committed.
- Generated Prisma client files must not be committed.
- Store S3 object keys so old files can be deleted.
- Keep implementation simple and assessment-focused.
