# Architecture

## 1. Stack

Wellspring is built as a full-stack monorepo application.

| Layer      | Tool                            | Purpose                                  |
| ---------- | ------------------------------- | ---------------------------------------- |
| Frontend   | Next.js App Router + TypeScript | Creator admin panel                      |
| Styling    | Tailwind CSS                    | UI styling                               |
| Backend    | Node.js + Express + TypeScript  | Admin API                                |
| Database   | PostgreSQL on Neon              | Persistent application data              |
| ORM        | Prisma                          | Database schema, migrations, and queries |
| Auth       | JWT stored in HTTP-only cookies | Creator/admin authentication             |
| Uploads    | AWS S3 pre-signed URLs          | Secure media upload flow                 |
| Validation | Zod                             | Request body and form validation         |
| Logging    | Pino + pino-http                | Structured JSON server logs              |
| Testing    | Jest + Supertest                | Backend API and tenant isolation tests   |

The app uses a monorepo structure with separate `backend` and `frontend` folders. The backend owns business logic, database access, authentication, uploads, imports, and audit logging. The frontend owns the creator-facing admin interface.

---

## 2. Application Layers

The application has four main layers:

```txt
Browser
  ↓
Next.js Admin Panel
  ↓
Express API
  ↓
PostgreSQL / S3
```

### Browser

The creator uses the browser to log in, manage programs, manage sessions, upload media, import CSV files, and view audit logs.

### Next.js Admin Panel

The frontend renders the admin UI. It sends API requests to the Express backend. It does not directly access the database.

### Express API

The backend handles authentication, tenant isolation, validation, business rules, database writes, S3 pre-signed upload URLs, CSV imports, and audit logs.

### PostgreSQL and S3

PostgreSQL stores creators, users, programs, sessions, bulk import records, and audit logs. S3 stores uploaded program/session media files.

---

## 3. Monorepo Structure

```txt
/
├── AGENTS.md
├── README.md
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── programs/
│   │   │   ├── sessions/
│   │   │   ├── imports/
│   │   │   ├── uploads/
│   │   │   └── audit/
│   │   ├── middleware/
│   │   ├── lib/
│   │   └── server.ts
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── dashboard/
│   │   │   ├── programs/
│   │   │   └── audit-logs/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── package.json
├── docs/
└── ai-history/
```

The monorepo keeps the backend, frontend, documentation, and AI-history artifacts in one repository so the reviewer can clone and inspect everything from a single place.

---

## 4. Request Flow

A normal authenticated request follows this flow:

```txt
Creator action in frontend
  ↓
Frontend sends request to Express API with cookies enabled
  ↓
Backend reads JWT from HTTP-only cookie
  ↓
Backend extracts userId and creatorId
  ↓
Backend validates request data
  ↓
Backend performs tenant-scoped database query
  ↓
Backend writes audit log for admin write actions
  ↓
Backend returns response
  ↓
Frontend updates UI
```

Example: creating a program.

```txt
Creator clicks Add Program
  ↓
Add Program modal submits title and description
  ↓
POST /programs
  ↓
Backend verifies JWT cookie
  ↓
Backend gets creatorId from token
  ↓
Backend creates program with creatorId
  ↓
Backend writes PROGRAM_CREATED audit log
  ↓
Frontend refreshes programs list
```

The frontend never sends `creatorId` manually. The backend always derives tenant identity from the authenticated cookie.

---

## 5. Multi-Tenant Data Model

Creators are tenants.

Each creator owns their own users, programs, sessions, imports, uploads, and audit logs.

The tenant boundary is `creatorId`.

Every creator-owned table must include `creatorId`.

Tenant-owned entities:

```txt
User
Program
Session
BulkImport
AuditLog
```

The backend must never trust tenant information from request bodies, query params, route params, or frontend state.

Correct source of tenant identity:

```txt
HTTP-only JWT cookie → backend auth middleware → req.user.creatorId
```

Unsafe pattern:

```ts
await prisma.program.findUnique({
  where: { id: programId },
});
```

Safe pattern:

```ts
await prisma.program.findFirst({
  where: {
    id: programId,
    creatorId: req.user.creatorId,
  },
});
```

If a creator tries to access another creator’s record, the API should return `404 Not Found`. This avoids revealing whether another tenant’s resource exists.

---

## 6. Authentication Boundary

Authentication uses JWT stored in an HTTP-only cookie.

The frontend does not store JWT in `localStorage` or `sessionStorage`.

Login flow:

```txt
POST /auth/login
  ↓
Backend validates email and password
  ↓
Backend creates JWT with userId and creatorId
  ↓
Backend sets HTTP-only cookie
  ↓
Frontend redirects to dashboard
```

JWT payload:

```ts
{
  userId: string;
  creatorId: string;
  email: string;
}
```

Cookie settings:

```ts
{
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000
}
```

Logout flow:

```txt
POST /auth/logout
  ↓
Backend clears auth cookie
  ↓
Frontend redirects to login
```

Protected routes:

```txt
/dashboard/programs
/dashboard/programs/[programId]
/dashboard/audit-logs
```

Public routes:

```txt
/login
/signup
```

---

## 7. Database Schema Overview

The database is PostgreSQL managed through Prisma migrations.

Main models:

```txt
Creator
User
Program
Session
BulkImport
AuditLog
```

### Creator

Represents a tenant.

Owns users, programs, sessions, imports, and audit logs.

### User

Represents a creator admin who can log in.

Each user belongs to one creator.

### Program

Represents a wellness program or course created by a creator.

Example:

```txt
30-Day Sleep Reset
Beginner Yoga Foundations
Morning Meditation Series
```

### Session

Represents a session inside a program.

Sessions belong to both a program and a creator.

Each session can contain:

```txt
title
duration
position
instructorName
tags
mediaType
mediaUrl
```

### BulkImport

Stores CSV import attempts and their result.

Used to make imports idempotent through `clientImportId`.

### AuditLog

Stores creator-facing admin activity history.

Examples:

```txt
PROGRAM_CREATED
PROGRAM_UPDATED
SESSION_CREATED
SESSION_UPDATED
SESSION_REORDERED
BULK_IMPORT_CREATED
UPLOAD_URL_REQUESTED
```

---

## 8. Core Data Flows

### Auth Flow

```txt
Signup/Login
  ↓
Backend creates or verifies user
  ↓
JWT is created with userId and creatorId
  ↓
JWT is stored in HTTP-only cookie
  ↓
Protected API requests use the cookie automatically
```

### Program and Session Management Flow

The Program Detail Page shows program information and sessions together.

Creator can:

```txt
Edit program
Add session
Edit session
Delete session
Reorder sessions
Bulk import sessions
```

Program editing happens through the Add/Edit Program modal.

Session editing happens through the Add/Edit Session modal.

The Program Detail Page is the main workspace for managing sessions.

### CSV Import Flow

CSV import is opened from the Program Detail Page using the Bulk Import button.

The import modal allows the creator to upload a CSV file for sessions.

The backend:

```txt
1. Verifies logged-in creator
2. Checks that the program belongs to the creator
3. Checks clientImportId for idempotency
4. Parses CSV file
5. Validates each row
6. Inserts valid rows
7. Returns row-level validation errors for failed rows
8. Writes audit log
```

A repeated import with the same `clientImportId` must not create duplicate sessions.

### S3 Upload Flow

Media uploads use S3 pre-signed URLs.

Flow:

```txt
Frontend requests upload URL
  ↓
Backend verifies creator
  ↓
Backend creates tenant-scoped S3 key
  ↓
Backend returns pre-signed upload URL
  ↓
Frontend uploads file directly to S3
  ↓
Frontend saves returned mediaUrl in program/session form
```

S3 key pattern:

```txt
creators/{creatorId}/sessions/{uuid}.{extension}
```

The backend does not accept arbitrary S3 paths from the frontend.

### Audit Log Flow

Every admin write action creates an audit log.

Examples:

```txt
Create program
Update program
Create session
Update session
Delete session
Reorder sessions
Import CSV
Request upload URL
```

Creators can view audit logs from the Audit Logs page.

---

## 9. Security Rules

The application must follow these rules:

```txt
Never store JWT in localStorage or sessionStorage.
JWT must be stored in an HTTP-only cookie.
Never trust creatorId from frontend.
Every tenant-owned query must include creatorId.
Cross-tenant access must return 404.
Every admin write action must create an audit log.
CSV imports must be idempotent.
S3 upload keys must be tenant-scoped.
Request bodies must be validated before database writes.
Passwords must be hashed before storing.
Server logs must be structured JSON.
```

CORS must allow credentials so the browser can send the auth cookie.

Backend CORS pattern:

```ts
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
```

Frontend API requests must use credentials:

```ts
withCredentials: true;
```

---

## 10. System Invariants

These rules must never be broken by the codebase or AI-generated changes.

```txt
Frontend must not directly access the database.
Frontend must not store JWT in localStorage or sessionStorage.
Backend must derive creatorId only from the verified JWT cookie.
Tenant-owned database queries must always be scoped by creatorId.
Program Detail Page is the main place for managing sessions.
Add/Edit Program is handled through a modal.
Add/Edit Session is handled through a modal.
CSV import is handled through a modal from the Program Detail Page.
CSV import must return row-level validation feedback.
CSV import retries with the same clientImportId must not duplicate sessions.
S3 uploads must use pre-signed URLs.
S3 object keys must include creatorId.
Audit logs are creator-facing records stored in the database.
Server logs are developer-facing structured JSON logs.
Prisma migrations are the only way to change database schema.
```
