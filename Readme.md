# Wellspring

Wellspring is a multi-tenant content management platform for wellness creators.

Creators can sign up, manage programs, add sessions, reorder sessions, import sessions from CSV, upload media through secure S3 pre-signed URLs, and view audit logs for admin actions.

This project is built as a **monorepo** with a separate frontend and backend.

---

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS v4
- Axios
- lucide-react

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma
- JWT auth with HTTP-only cookies
- AWS S3 pre-signed uploads
- Jest / Supertest

---

## Monorepo Structure

```txt
wellspring/
  backend/
    prisma/
      schema.prisma
      migrations/
      seed.ts
    src/
      modules/
      lib/
      middleware/
      server.ts
    tests/

  frontend/
    app/
    components/
    lib/

  docs/
    CODE_SUMMARY.md

  context/
    designs/
    architecture.md
    build-plan.md
    code-standards.md
    library-docs.md
    progress-tracker.md
    project-overview.md
    ui-registry.md
    ui-rules.md

  ai-history/
    01-research.md
    02-design.md
    03-developement.md

  .agents/
    skills/
```

---

## Prerequisites

Make sure these are installed:

```txt
Node.js
npm
PostgreSQL database
AWS S3 bucket
```

The project uses PostgreSQL. Neon can be used for the database.

---

## Setup

Clone the repository:

```bash
git clone <repo-url>
cd wellspring
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

---

## Environment Variables

Create a `.env` file inside `backend/`.

```env
PORT=5000
DATABASE_URL="postgresql://..."

JWT_SECRET="your-long-secret"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"

AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET_NAME="your-bucket-name"
AWS_S3_PUBLIC_BASE_URL="https://your-bucket-name.s3.ap-south-1.amazonaws.com"
```

Create a `.env.local` file inside `frontend/`.

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

Do not commit real `.env` files.

---

## Database Migration

Run migrations from the backend folder:

```bash
cd backend
npm run db:migrate
```

This applies Prisma migration files to the PostgreSQL database.

Migration files are committed under:

```txt
backend/prisma/migrations/
```

Schema changes should always go through Prisma migrations.

---

## Seed Database

Run the seed script from the backend folder:

```bash
cd backend
npm run db:seed
```

The seed script creates demo data including:

```txt
2 creators
3 programs per creator
around 10 sessions per program
```

---

## Run the Project

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

Backend runs on:

```txt
http://localhost:5000
```

---

## Test

Run backend tests:

```bash
cd backend
npm test
```
