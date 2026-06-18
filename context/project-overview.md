# Project Overview

## About the Project

Wellspring is a multi-tenant content management platform for wellness creators.

Each creator has their own branded admin space where they can manage wellness programs and the sessions inside those programs. Programs are structured collections of sessions, such as “30-Day Sleep Reset” or “Beginner Yoga Foundations”. Sessions can contain audio or video media, ordered positions, duration, instructor information, and tags.

The application includes creator authentication, program management, session management, drag-and-drop session ordering, bulk CSV session import, secure S3 media uploads, and an audit log for admin actions.

The main goal is to build a practical admin panel with strong tenant isolation and clean backend architecture.

---

## The Problem It Solves

Wellness creators need a simple way to manage structured content like courses, programs, and media sessions.

Without a dedicated admin platform, creators may manage content manually across spreadsheets, file storage, and disconnected tools. This becomes difficult when each creator needs their own private workspace, branded content, secure media uploads, and a clear record of admin changes.

Wellspring solves this by giving each creator a private admin panel where they can manage their programs, upload media, organize sessions, import sessions in bulk, and review audit history.

---

## Core Domain

### Creator

A creator is the tenant in the system.

Each creator has their own private workspace and admin login.

Example:

```txt id="s6b5jy"
Lumina Wellness
Calm Path Studio
```

### User

A user is the person who logs in and manages a creator workspace.

For the initial version, signup creates one creator and one owner user.

```txt id="pzb8lz"
Creator = tenant/workspace/brand
User    = login account inside that creator
```

### Program

A program belongs to one creator.

Examples:

```txt id="k8k9xn"
30-Day Sleep Reset
Beginner Yoga Foundations
Morning Meditation Series
```

A program can have:

```txt id="u645t4"
title
description
cover image
sessions
```

### Session

A session belongs to one program and one creator.

A session can have:

```txt id="fln9jq"
title
duration
ordered position
instructor name
tags
media type
media URL
media key
```

### Audit Log

Audit logs record creator admin actions.

Examples:

```txt id="m4l04q"
program created
program updated
session created
session reordered
CSV import completed
upload URL requested
```

Audit logs are visible in the admin panel and scoped to the logged-in creator.

---

## Pages

```txt id="tz86e9"
/login                  → Creator login
/signup                 → Creator signup
/programs               → Program list and program actions
/programs/[programId]   → Program details, sessions, reorder, CSV import, media upload
/audit-logs             → Audit log viewer with filters
```

---

## Navigation

The admin panel uses a simple sidebar layout.

Primary navigation:

```txt id="w4hrxy"
Programs
Audit Logs
```

The sidebar should stay minimal. Do not add extra navigation items unless they are required by the assessment.

---

## Core User Flow

### Signup

- Creator visits the signup page.
- Creator enters creator/workspace details, email, and password.
- Backend creates a `Creator`.
- Backend creates the first `User` under that creator.
- User becomes the owner of that creator workspace.
- Backend sets an HTTP-only JWT cookie.
- User is redirected to the Programs page.

### Login

- User enters email and password.
- Backend validates credentials.
- Backend sets an HTTP-only JWT cookie.
- Frontend redirects to the Programs page.
- JWT is never stored in `localStorage` or `sessionStorage`.

### Programs

- Creator views their own programs.
- Creator can create a program using a modal.
- Creator can edit a program using a modal.
- Creator can upload or replace a program cover image.
- Creator can delete a program.
- Program actions create audit log records.

### Program Detail

- Creator opens a program detail page.
- Page shows program information and sessions inside the program.
- Creator can add a session using a modal.
- Creator can edit a session using a modal.
- Creator can upload or replace session media.
- Creator can delete a session.
- Creator can reorder sessions.
- Session actions create audit log records.

### Session Reorder

- Creator drags sessions into a new order.
- Frontend sends ordered session IDs to the backend.
- Backend verifies all sessions belong to the same creator and program.
- Backend updates session positions.
- Reorder action creates an audit log record.

### CSV Import

- Creator opens the CSV import modal from the Program Detail page.
- Creator uploads a `.csv` file.
- Backend validates the file row by row.
- Valid rows are inserted as sessions.
- Invalid rows are returned with row-level errors.
- Import uses `clientImportId` for idempotency.
- Retrying the same import does not duplicate sessions.
- Import action creates an audit log record.

### S3 Upload

- Creator selects a program image or session media file.
- Frontend requests a pre-signed upload URL from the backend.
- Backend verifies the creator and program ownership.
- Backend creates a tenant-scoped S3 object key.
- Frontend uploads the file directly to S3.
- Frontend saves the returned `fileUrl` and `fileKey` when creating or updating the program/session.
- If a file is replaced or deleted, the old S3 object should be deleted using the stored key.

### Audit Logs

- Creator opens the Audit Logs page.
- Creator can filter logs by date range and action type.
- Creator only sees audit logs from their own workspace.

---

## Data Architecture

### Tenant Model

Wellspring uses a shared database with tenant-owned rows.

Each tenant-owned table includes `creatorId`.

Tenant-owned tables:

```txt id="vm13ai"
users
programs
sessions
bulk_imports
audit_logs
```

The backend gets `creatorId` from the verified JWT cookie.

The frontend must never send or control `creatorId`.

---

## Main Data Models

### Creator

Represents the tenant/workspace.

```txt id="efwjs7"
id
name
brandName
createdAt
updatedAt
```

### User

Represents an admin login inside a creator workspace.

```txt id="k3emyd"
id
creatorId
email
passwordHash
role
createdAt
updatedAt
```

### Program

Represents a wellness program owned by a creator.

```txt id="7vfvik"
id
creatorId
title
description
coverImageUrl
coverImageKey
createdAt
updatedAt
```

### Session

Represents a media session inside a program.

```txt id="sq65lp"
id
creatorId
programId
title
duration
position
instructorName
tags
mediaType
mediaUrl
mediaKey
createdAt
updatedAt
```

### Bulk Import

Stores CSV import result and idempotency information.

```txt id="ugxaib"
id
creatorId
programId
clientImportId
status
resultJson
createdAt
```

### Audit Log

Stores admin write actions.

```txt id="9e58mv"
id
creatorId
actorId
action
targetEntity
targetId
metadata
createdAt
```

---

## Features In Scope

- Creator signup
- Creator login
- HTTP-only cookie based JWT auth
- Logout
- Program list
- Program create modal
- Program edit modal
- Program delete
- Program cover image upload using S3 pre-signed URL
- Program detail page
- Session list
- Session create modal
- Session edit modal
- Session delete
- Session media upload using S3 pre-signed URL
- Drag-and-drop session reorder
- Bulk CSV session import
- Row-level CSV validation feedback
- Idempotent CSV import using `clientImportId`
- Audit log viewer
- Audit log filters by date range and action type
- Tenant isolation in database queries
- Structured JSON server logs with request and tenant context
- Prisma migrations
- Seed script with demo creators, programs, and sessions
- Required tenant isolation tests
- README, code summary, architecture review, AI history, and Loom walkthrough

---

## Features Out of Scope

- Learner-facing app
- Payment or subscription system
- Advanced role-based permissions
- Multiple users per creator workspace UI
- Resumable multipart uploads
- Analytics dashboard
- Notifications
- Program publishing workflow
- Full design system beyond the required admin UI

---

## Security Priorities

### Tenant Isolation

Tenant isolation is the highest priority.

Every tenant-owned query must include `creatorId`.

Unsafe:

```txt id="m259lb"
Find program by id only
```

Safe:

```txt id="1l1n43"
Find program by id and creatorId
```

Cross-tenant access should return `404` to avoid revealing whether another creator’s resource exists.

### Authentication

- JWT is stored only in an HTTP-only cookie.
- Cookie name is `access_token`.
- Frontend sends authenticated requests with credentials.
- JWT is never stored in browser storage.
- Passwords are hashed before storage.

### S3 Upload Security

- Frontend never receives AWS credentials.
- Backend generates short-lived pre-signed URLs.
- S3 object keys include `creatorId`.
- Backend verifies creator ownership before generating upload URLs.
- File type and size are validated.
- Old S3 files are deleted when replaced or removed.

### Auditability

Every admin write action should create an audit log.

Audit logs help answer:

```txt id="gynuq6"
Who changed this?
What changed?
Which entity was affected?
When did it happen?
```

---

## Target User

The target user is a wellness creator or admin who:

- Creates structured wellness programs
- Manages audio or video sessions
- Needs a private branded workspace
- Wants to bulk import session content
- Wants a simple admin panel
- Needs secure media uploads
- Needs visibility into admin changes

---

## Success Criteria

- Creator can sign up and log in.
- Creator can manage only their own data.
- Creator can create, edit, and delete programs.
- Creator can upload program images.
- Creator can manage sessions inside a program.
- Creator can upload session media.
- Creator can reorder sessions.
- Creator can import sessions from CSV.
- CSV import shows clear row-level validation errors.
- Repeating the same CSV import does not duplicate sessions.
- Audit logs are created for admin write actions.
- Audit logs can be filtered by date range and action type.
- Cross-tenant access is blocked at the data query level.
- Tenant isolation tests pass.
- Prisma migrations and seed data are included.
- Structured JSON logs include request and tenant context.
- UI is clean, functional, and consistent.
- README and required documentation are complete.
- Loom walkthrough clearly explains demo, schema, tenant isolation, and AI usage.

---

## Submission Focus

This project should prioritize correctness and clarity over feature count.

The most important areas are:

```txt id="ib57ve"
tenant isolation
idempotent CSV import
secure S3 upload flow
audit logging
migration and seed setup
clear documentation
honest architecture review
```

A smaller but well-understood implementation is better than a large implementation with weak tenant isolation or unclear architecture.
