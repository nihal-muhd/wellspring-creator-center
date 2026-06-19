# Code Summary

## auth/

Handles signup, login, logout, and current user lookup. Signup creates a creator workspace and the first owner user. Auth uses HTTP-only cookies, not localStorage or sessionStorage.

## creators / tenants

The creator is the tenant/workspace in the system. All creator-owned data is scoped using `creatorId`. The frontend never controls `creatorId`; backend gets it from the verified auth cookie.

## programs/

Handles program create, read, update, and delete. Program queries are always scoped by `creatorId` to prevent cross-tenant access. Program image URL and S3 key are stored for preview and cleanup.

## sessions/

Handles sessions inside a program. Sessions store title, duration, position, instructor, tags, media type, media URL, and media key. Session queries are scoped by both `creatorId` and `programId`.

## imports/

Handles CSV bulk import for sessions. The frontend sends a `clientImportId` with the file so duplicate retries do not create duplicate sessions. Invalid rows return row-level validation errors.

## uploads/

Handles S3 pre-signed upload and read URLs. Upload keys are tenant-scoped using `creatorId`. Old S3 objects are deleted when files are replaced or removed.

## audit/

Stores creator-facing audit logs for admin write actions. Logs are scoped by `creatorId` and can be filtered by date and action type. Audit logs are separate from server logs.

## middleware/

Contains auth, request ID, error handling, and logging middleware. Auth middleware attaches `userId` and `creatorId` to protected requests. Logging includes request and tenant context.

## prisma/

Contains schema, migrations, and seed data. Schema changes go through Prisma migrations, not manual SQL. Generated Prisma client files are ignored because they can be regenerated.

## frontend/

Contains the Next.js admin UI. Main screens are signup, login, programs, program detail, and audit logs. Add/edit flows use modals to keep the UI simple.
