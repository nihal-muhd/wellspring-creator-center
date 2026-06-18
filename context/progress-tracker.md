# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately understand what is done, what is in progress, and what is next.

---

## Current Status

**Current Phase:** Phase 1 — Auth
**Last completed:** Signup page
**Next:** Signup API

---

## Progress

### Phase 1 — Auth

- [x] 01 Signup page
- [ ] 02 Signup API
- [ ] 03 Login page
- [ ] 04 Login API
- [ ] 05 Auth me API
- [ ] 06 Protected frontend route handling

### Phase 2 — Programs

- [ ] 07 Programs page
- [ ] 08 Add Program modal
- [ ] 09 Edit Program modal
- [ ] 10 Program CRUD APIs
- [ ] 11 Program image upload connection
- [ ] 12 Program audit logs

### Phase 3 — Program Detail + Sessions

- [ ] 13 Program Detail page
- [ ] 14 Session list UI
- [ ] 15 Add Session modal
- [ ] 16 Edit Session modal
- [ ] 17 Session CRUD APIs
- [ ] 18 Session media upload connection
- [ ] 19 Session audit logs

### Phase 4 — Session Reorder

- [ ] 20 Drag-and-drop session reorder UI
- [ ] 21 Reorder API
- [ ] 22 Save reordered positions
- [ ] 23 Reorder audit log

### Phase 5 — CSV Import

- [ ] 24 CSV Import modal
- [ ] 25 CSV import API
- [ ] 26 Row-level validation feedback
- [ ] 27 Idempotent import handling
- [ ] 28 Import audit log

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
- Prioritize frontend first inside each phase.
- Tenant isolation is the highest priority.
- Every tenant-owned backend query must include `creatorId`.
- JWT must stay in HTTP-only cookie only.
- Do not store JWT in `localStorage` or `sessionStorage`.
- Prisma migration files must be committed.
- Generated Prisma client files must not be committed.
- Store S3 object keys so old files can be deleted.
- Keep implementation simple and assessment-focused.
