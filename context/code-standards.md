# Code Standards

Implementation rules and conventions for the Wellspring project.

These rules must be followed across all frontend, backend, database, and documentation work. The goal is to keep the project practical, readable, secure, and consistent across all phases.

---

## 1. Engineering Mindset

- Understand the current phase before writing code.
- Build only what the current phase requires.
- Avoid over-engineering.
- Prefer simple readable code over clever abstractions.
- Every feature must be testable after implementation.
- Complete one feature fully before moving to the next.
- Keep the assessment requirements as the source of truth.
- Do not add extra features just because they seem useful.
- When unsure, ask before changing architecture or adding dependencies.

---

## 2. TypeScript Rules

- Use TypeScript in both frontend and backend.
- Avoid `any`.
- Use `unknown` and narrow the type when the shape is not known.
- Use explicit function parameter and return types where practical.
- Use `const` by default.
- Use `let` only when reassignment is needed.
- Avoid unnecessary type assertions.
- Do not silence TypeScript errors without understanding the cause.
- Prefer clear types close to the code that uses them.
- Move types to shared files only when reused across multiple files.

Example:

```ts
type CreateProgramInput = {
  title: string;
  description?: string;
};

export async function createProgram(
  input: CreateProgramInput,
  creatorId: string,
): Promise<Program> {
  // implementation
}
```

---

## 3. File and Folder Naming

### General

- Folders use kebab-case.
- Utility files use camelCase.
- Component files use PascalCase.
- One component per file.
- Avoid large mixed-purpose files.

### Frontend

```txt
components/programs/ProgramCard.tsx
components/programs/ProgramFormModal.tsx
components/sessions/SessionList.tsx
components/sessions/SessionFormModal.tsx
lib/api.ts
```

### Backend

```txt
src/modules/auth/auth.routes.ts
src/modules/auth/auth.controller.ts
src/modules/auth/auth.service.ts
src/modules/auth/auth.schema.ts

src/modules/programs/programs.routes.ts
src/modules/programs/programs.controller.ts
src/modules/programs/programs.service.ts
src/modules/programs/programs.repository.ts
src/modules/programs/programs.schema.ts
```

---

## 4. Frontend Standards

- Use Next.js App Router.
- Use named exports for components.
- `page.tsx` and `layout.tsx` can use default exports because Next.js requires it.
- Components are Server Components by default.
- Add `"use client"` only when the component needs:
  - state
  - effects
  - browser APIs
  - event handlers
  - modals
  - drag-and-drop
  - file uploads

- Do not add `"use client"` to a full page unless necessary.
- Keep API calls in `lib/api.ts` or feature-specific API files.
- Do not store JWT in `localStorage`.
- Do not store JWT in `sessionStorage`.
- All authenticated frontend API requests must send cookies.
- Use `lucide-react` for icons.

Example:

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});
```

---

## 5. Backend Structure

Backend code should follow this structure:

```txt
route → controller → service → repository
```

### Route

Defines the endpoint and connects middleware.

```ts
router.get("/:programId", authMiddleware, getProgramController);
```

### Controller

Handles request and response.

```ts
export async function getProgramController(req: Request, res: Response) {
  const program = await getProgramService({
    programId: req.params.programId,
    creatorId: req.user.creatorId,
  });

  return res.json({
    success: true,
    data: program,
  });
}
```

### Service

Handles business logic.

```ts
export async function getProgramService(input: GetProgramInput) {
  const program = await findProgramByIdForCreator(
    input.programId,
    input.creatorId,
  );

  if (!program) {
    throw new NotFoundError("Program not found");
  }

  return program;
}
```

### Repository

Handles direct Prisma database queries.

```ts
export async function findProgramByIdForCreator(
  programId: string,
  creatorId: string,
) {
  return prisma.program.findFirst({
    where: {
      id: programId,
      creatorId,
    },
  });
}
```

Repositories are important because tenant-safe database queries can be reviewed in one place.

---

## 6. API Response Standards

All API responses should follow the same shape.

### Success Response

```ts
{
  success: true,
  data: result
}
```

### Error Response

```ts
{
  success: false,
  error: "Program not found"
}
```

Do not return raw database records directly without the success wrapper.

Good:

```ts
return res.json({
  success: true,
  data: programs,
});
```

Avoid:

```ts
return res.json(programs);
```

---

## 7. Authentication Standards

- JWT must be stored only in an HTTP-only cookie.
- Cookie name should be `access_token`.
- Do not expose JWT to frontend JavaScript.
- Do not use `localStorage` or `sessionStorage` for auth tokens.
- Logout must clear the cookie.
- Protected backend routes must read the user from the verified cookie.
- Frontend requests must use `withCredentials: true`.
- Backend CORS must use `credentials: true`.

JWT payload should include:

```ts
{
  userId: string;
  creatorId: string;
  email: string;
}
```

The frontend must never send `creatorId` manually for tenant ownership.

---

## 8. Multi-Tenant Query Standards

Tenant isolation is the most important rule in the project.

- `creatorId` must come from the authenticated JWT cookie.
- Never trust `creatorId` from the request body, query params, or frontend state.
- Every tenant-owned database query must include `creatorId`.
- Tenant-owned entities include:
  - users
  - programs
  - sessions
  - bulk imports
  - audit logs

- Cross-tenant access should return `404`, not `403`.
- Do not reveal whether another tenant’s record exists.

Unsafe:

```ts
await prisma.program.findUnique({
  where: {
    id: programId,
  },
});
```

Safe:

```ts
await prisma.program.findFirst({
  where: {
    id: programId,
    creatorId,
  },
});
```

For updates, prefer `updateMany` with `creatorId`:

```ts
const result = await prisma.program.updateMany({
  where: {
    id: programId,
    creatorId,
  },
  data,
});

if (result.count === 0) {
  throw new NotFoundError("Program not found");
}
```

---

## 9. Prisma Standards

- Use the shared Prisma client from `src/lib/prisma.ts`.
- Do not create a new `PrismaClient` inside every module.
- Repository files should be the main place where Prisma queries are written.
- Use migrations for schema changes.
- Commit migration files.
- Commit `schema.prisma`.
- Commit `seed.ts`.
- Do not commit generated Prisma client files.
- Generated Prisma client should be ignored in Git.
- Run `npx prisma generate` after schema changes.
- Use transactions for multi-step writes that must stay consistent.

Commit these:

```txt
backend/prisma/schema.prisma
backend/prisma.config.ts
backend/prisma/migrations/
backend/prisma/seed.ts
```

Ignore this:

```txt
backend/src/generated/prisma/
```

Use transactions for reorder operations:

```ts
await prisma.$transaction(async (tx) => {
  for (const item of orderedSessions) {
    await tx.session.updateMany({
      where: {
        id: item.id,
        creatorId,
        programId,
      },
      data: {
        position: item.position,
      },
    });
  }
});
```

---

## 10. Validation Standards

- Use Zod for request body validation.
- Validate route params where needed.
- Validate query params for filters and pagination.
- Never pass raw `req.body` directly to Prisma.
- CSV rows must be validated before inserting sessions.
- File upload inputs must validate file type and size.
- S3 upload requests must validate content type.

Example:

```ts
const createProgramSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

const parsed = createProgramSchema.parse(req.body);
```

---

## 11. Error Handling Standards

- Do not use empty catch blocks.
- Do not expose raw internal errors to users.
- Log errors with context.
- Return human-readable error messages.
- Use central error middleware in Express.
- Cross-tenant missing resources should return `404`.
- Validation errors should return `400`.
- Unauthenticated requests should return `401`.

Example:

```ts
try {
  const result = await serviceCall();

  return res.json({
    success: true,
    data: result,
  });
} catch (error) {
  next(error);
}
```

---

## 12. Audit and Logging Standards

There are two types of logs in this project.

### Audit Logs

Audit logs are stored in the database and visible to creators in the admin panel.

Create audit logs for admin write actions:

- program created
- program updated
- program deleted
- session created
- session updated
- session deleted
- session reordered
- bulk CSV import completed
- upload URL requested

Audit logs should include:

```txt
creatorId
actorId
action
targetEntity
targetId
metadata
createdAt
```

### Server Logs

Server logs are for developers.

- Use structured JSON logs.
- Every request log should include `request_id`.
- Authenticated request logs should include `tenant_id`.
- Do not log passwords.
- Do not log JWT values.
- Do not log full S3 signed URLs.

---

## 13. UI Standards

- Use Tailwind CSS for styling.
- Use `lucide-react` for icons.
- Keep UI simple and clean.
- Use modals for:
  - add program
  - edit program
  - add session
  - edit session
  - CSV import

- Show loading states for API operations.
- Show error states clearly.
- Show empty states for empty program/session/audit lists.
- Avoid complex animations unless they improve usability.
- Do not add unnecessary dashboards or extra pages.

Main pages:

```txt
/login
/signup
/programs
/programs/[programId]
/audit-logs
```

---

## 14. Import Rules

- Group external imports first.
- Group internal imports second.
- Use `@/` alias in frontend.
- Avoid deep relative imports where possible.
- Do not use barrel exports except in `components/ui` if needed.

Good:

```ts
import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
```

Avoid:

```ts
import { Button } from "../../../components/ui/button";
```

---

## 15. Comments

- Do not write comments that explain obvious code.
- Code should explain what it does.
- Comments should explain why a non-obvious decision exists.
- Do not leave TODO comments in committed code.
- Do not leave commented-out code in committed code.

Good:

```ts
// Return 404 to avoid revealing cross-tenant resource existence.
throw new NotFoundError("Program not found");
```

Avoid:

```ts
// Get program by id
const program = await getProgram(id);
```

---

## 16. Dependency Rules

- Do not install a new package without a clear reason.
- Prefer existing project dependencies when they solve the problem.
- Prefer native APIs when the implementation is simple.
- Do not add a package for one small helper function.
- Ask before adding a new dependency.
- Every dependency must support a project requirement.
- Do not add multiple libraries for the same purpose.

---

## 17. Allowed Feature Libraries

These libraries are approved for specific project features.

This does not mean every library must be installed immediately. Install only when the feature phase needs it.

### Icons

```txt
lucide-react
```

Use only `lucide-react` for icons.

### API Client

```txt
axios
```

Use axios through the shared API client with `withCredentials: true`.

### Forms and Validation

```txt
react-hook-form
zod
```

Use Zod for validation schemas.

### CSV Import

```txt
multer
csv-parse
```

Use `multer` to receive uploaded CSV files in Express.

Use `csv-parse` to parse CSV rows.

### S3 Uploads

```txt
@aws-sdk/client-s3
@aws-sdk/s3-request-presigner
```

Use AWS SDK only for the secure pre-signed upload flow.

Do not upload media through the backend server.

### Drag and Drop

```txt
@dnd-kit/core
@dnd-kit/sortable
@dnd-kit/utilities
```

Use dnd-kit for session reorder UI.

Do not build drag-and-drop manually unless dnd-kit becomes unnecessary.

### Database

```txt
Prisma
PostgreSQL
```

Use Prisma repositories for database access.

Do not write raw SQL unless Prisma cannot support the required operation.

---

## 18. Testing Standards

- Tests should focus on important guarantees.
- Tenant isolation tests are required.
- Import idempotency should be tested.
- Upload key tenant scoping should be tested.
- Tests should use clear names.

Required test names:

```txt
rejects cross-tenant program access
rejects cross-tenant session access
rejects cross-tenant audit log access
does not duplicate sessions for repeated clientImportId
creates tenant-scoped presigned upload key
```

Tests should be practical and readable.

---

## 19. Documentation Standards

Keep documentation honest and simple.

Required docs:

```txt
README.md
docs/CODE_SUMMARY.md
docs/ARCHITECTURE_REVIEW.md
ai-history/
```

README should include:

```txt
setup
env
migration
seed
run
test
Loom link
```

Do not over-explain basic technologies.

Explain project-specific decisions:

```txt
tenant isolation
HTTP-only cookie auth
CSV idempotency
S3 upload flow
audit logs
structured logging
```
