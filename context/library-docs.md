# Library Docs

Project-specific usage patterns for third-party libraries used in Wellspring.

This file only covers how we use each library in this project. It does not replace official documentation. When implementing a library-heavy feature, check the latest docs or installed skills first.

---

## 1. Before Using Any Library

Before implementing a feature that depends on a third-party library:

1. Check `AGENTS.md` for installed skills or project-specific instructions.
2. Check this file for Wellspring-specific usage rules.
3. Use official documentation when APIs may have changed.
4. Do not rely on general memory alone for fast-moving libraries.

Order of authority:

```txt
Official .agents / installed skills
AGENTS.md
library-docs.md
code-standards.md
```

Do not install a new library unless it is already approved in `code-standards.md` or explicitly confirmed.

---

## 2. AWS S3 Uploads

Wellspring uses S3 for program images and session media.

The backend must never receive or store large media files directly. The backend only creates a short-lived pre-signed upload URL. The frontend uploads the file directly to S3 using that URL.

### Libraries

```txt
@aws-sdk/client-s3
@aws-sdk/s3-request-presigner
```

### Upload Types

Program media:

```txt
image/jpeg
image/png
image/webp
```

Session media:

```txt
audio/*
video/*
```

### File Size Limit

Use `100MB` as the project file size limit unless changed later.

Program images should usually be much smaller, but the shared max limit can remain `100MB` for now.

---

### Required Environment Variables

```env
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET_NAME="..."
AWS_S3_PUBLIC_BASE_URL="https://your-bucket.s3.ap-south-1.amazonaws.com"
```

Do not expose AWS credentials to the frontend.

Never use `NEXT_PUBLIC_` for AWS secrets.

---

### S3 Client

Create a shared S3 client in the backend.

```ts
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
```

Keep this in:

```txt
backend/src/lib/s3.ts
```

---

### S3 Key Patterns

All S3 keys must include `creatorId`.

Program image:

```txt
creators/{creatorId}/programs/{programId}/images/{uuid}.{extension}
```

Session media:

```txt
creators/{creatorId}/programs/{programId}/sessions/{uuid}.{extension}
```

Do not use original filenames directly as S3 keys.

Good:

```txt
creators/clx123/programs/prg123/images/550e8400-e29b-41d4-a716-446655440000.webp
```

Avoid:

```txt
photo.png
```

---

### Database Storage Rules

Store both the object URL and the S3 object key.

For programs:

```txt
coverImageUrl
coverImageKey
```

For sessions:

```txt
mediaUrl
mediaKey
```

The stored URL is metadata only and must not be rendered directly.

The key is required for authenticated read URLs and deleting the file from S3.

Do not try to delete S3 objects by parsing the URL if the key is already available.

---

### Pre-Signed Upload URL Flow

Frontend:

```txt
1. User selects file.
2. Frontend sends file metadata to backend.
3. Backend validates tenant, file type, and target entity.
4. Backend returns uploadUrl, fileUrl, and fileKey.
5. Frontend uploads file directly to S3 using uploadUrl.
6. Frontend saves fileUrl and fileKey when creating/updating program or session.
```

Backend endpoint:

```txt
POST /uploads/presign
```

Request body:

```ts
type PresignUploadRequest = {
  uploadType: "PROGRAM_IMAGE" | "SESSION_MEDIA";
  programId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
};
```

Response:

```ts
type PresignUploadResponse = {
  success: true;
  data: {
    uploadUrl: string;
    fileUrl: string;
    fileKey: string;
    expiresIn: number;
  };
};
```

---

### Backend Pre-Sign Example

```ts
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

import { s3Client } from "../../lib/s3";

type CreatePresignedUploadInput = {
  creatorId: string;
  programId: string;
  uploadType: "PROGRAM_IMAGE" | "SESSION_MEDIA";
  fileName: string;
  contentType: string;
  fileSize: number;
};

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function isAllowedProgramImage(contentType: string): boolean {
  return ["image/jpeg", "image/png", "image/webp"].includes(contentType);
}

function isAllowedSessionMedia(contentType: string): boolean {
  return contentType.startsWith("audio/") || contentType.startsWith("video/");
}

export async function createPresignedUploadUrl(
  input: CreatePresignedUploadInput,
) {
  const maxFileSize = 100 * 1024 * 1024;

  if (input.fileSize > maxFileSize) {
    throw new Error("File size exceeds limit");
  }

  if (
    input.uploadType === "PROGRAM_IMAGE" &&
    !isAllowedProgramImage(input.contentType)
  ) {
    throw new Error("Invalid program image type");
  }

  if (
    input.uploadType === "SESSION_MEDIA" &&
    !isAllowedSessionMedia(input.contentType)
  ) {
    throw new Error("Invalid session media type");
  }

  const extension = getFileExtension(input.fileName);
  const fileId = crypto.randomUUID();

  const fileKey =
    input.uploadType === "PROGRAM_IMAGE"
      ? `creators/${input.creatorId}/programs/${input.programId}/images/${fileId}.${extension}`
      : `creators/${input.creatorId}/programs/${input.programId}/sessions/${fileId}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileKey,
    ContentType: input.contentType,
  });

  const expiresIn = 300;

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn,
  });

  const fileUrl = `${process.env.AWS_S3_PUBLIC_BASE_URL}/${fileKey}`;

  return {
    uploadUrl,
    fileUrl,
    fileKey,
    expiresIn,
  };
}
```

Important:

```txt
The Content-Type used when uploading from frontend must match the ContentType used while generating the signed URL.
```

---

### Frontend Upload Example

```ts
async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }
}
```

Frontend sequence:

```ts
const presignResponse = await api.post("/uploads/presign", {
  uploadType: "PROGRAM_IMAGE",
  programId,
  fileName: file.name,
  contentType: file.type,
  fileSize: file.size,
});

const { uploadUrl, fileUrl, fileKey } = presignResponse.data.data;

await uploadFileToS3(uploadUrl, file);

await api.patch(`/programs/${programId}`, {
  coverImageUrl: fileUrl,
  coverImageKey: fileKey,
});
```

### Private Read URL Flow

The S3 bucket remains private. The frontend must not render stored
`coverImageUrl` or `mediaUrl` values directly.

```txt
1. Frontend receives a stored S3 key with program/session data.
2. Frontend sends the key to POST /uploads/read-url.
3. Backend gets creatorId from the verified auth cookie.
4. Backend verifies the key starts with creators/{creatorId}/.
5. Backend verifies the key is referenced by that creator's program or session.
6. Backend signs GetObjectCommand for 600 seconds.
7. Frontend uses the temporary URL for image/audio/video rendering.
```

Request:

```ts
{
  fileKey: string;
}
```

Response:

```ts
{
  success: true;
  data: {
    readUrl: string;
    expiresIn: 600;
  };
}
```

Do not make the bucket public to display uploaded media.

---

### Deleting Files from S3

When a user removes or replaces a file, the old S3 object should be deleted.

Use `DeleteObjectCommand`.

```ts
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { s3Client } from "../../lib/s3";

export async function deleteS3Object(fileKey: string): Promise<void> {
  if (!fileKey) return;

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileKey,
  });

  await s3Client.send(command);
}
```

Delete rules:

```txt
When replacing a program image:
delete old coverImageKey after new image is saved successfully.

When removing a program image:
delete old coverImageKey and set coverImageUrl/coverImageKey to null.

When deleting a session:
delete mediaKey if it exists.

When replacing session media:
delete old mediaKey after new media is saved successfully.

When deleting a program:
delete program coverImageKey and all related session mediaKey values.
```

Do not delete the old file before the database update succeeds.

Safer order for replace:

```txt
1. Upload new file to S3.
2. Save new fileUrl and fileKey in database.
3. Delete old S3 object.
```

Safer order for delete:

```txt
1. Read existing fileKey from database using creatorId.
2. Delete database record or null out file fields.
3. Delete S3 object.
```

If S3 deletion fails after DB update, log the failure. Do not expose raw AWS errors to the user.

---

### S3 Security Rules

- Never expose AWS credentials to the frontend.
- Never accept `creatorId` from the frontend.
- Always get `creatorId` from the verified auth cookie.
- Always verify the program belongs to the logged-in creator before generating an upload URL.
- S3 keys must include `creatorId`.
- Do not generate upload URLs for another creator’s program.
- Do not log pre-signed URLs.
- Do not render stored S3 object URLs directly.
- Read URLs must use `GetObjectCommand` and expire after 600 seconds.
- Read keys must start with `creators/{creatorId}/` and be owned by the creator.
- Do not log AWS secrets.
- Keep pre-signed URLs short-lived.
- Use `300` seconds expiry unless changed later.
- Validate file type and size before creating the signed URL.

---

## 3. dnd-kit Drag and Drop

Wellspring uses dnd-kit only for session reorder inside the Program Detail Page.

### Libraries

```txt
@dnd-kit/core
@dnd-kit/sortable
@dnd-kit/utilities
```

Install only when implementing the session reorder phase.

---

### Usage Scope

Use drag-and-drop only for:

```txt
Reordering sessions inside one program
```

Do not use dnd-kit for unrelated UI interactions.

---

### Frontend Pattern

Use:

```txt
DndContext
SortableContext
useSortable
arrayMove
```

After drag ends:

```txt
1. Update local UI order.
2. Send ordered session IDs to backend.
3. Backend validates and saves final order.
4. If backend fails, refetch sessions or rollback local state.
```

The backend is the source of truth.

---

### Reorder API Payload

```ts
type ReorderSessionsRequest = {
  sessionIds: string[];
};
```

Endpoint:

```txt
POST /programs/:programId/sessions/reorder
```

Example request:

```json
{
  "sessionIds": ["session_1", "session_2", "session_3"]
}
```

Backend must verify:

```txt
program belongs to creator
all session IDs belong to creator
all session IDs belong to the same program
no duplicate session IDs
no missing existing sessions if full reorder is expected
```

---

### dnd-kit Rules

- Drag-and-drop is frontend-only.
- Never trust frontend order blindly.
- Always persist order through backend.
- Use session `id` as sortable ID.
- Do not use array index as sortable ID.
- Keep drag UI simple.
- Reorder only within the current program.

---

## 4. lucide-react Icons

Wellspring uses `lucide-react` for icons.

Do not use another icon library.

### Approved Icons

Programs:

```ts
import { Presentation } from "lucide-react";
```

Audit logs:

```ts
import { ClockFading } from "lucide-react";
```

Edit:

```ts
import { Pen } from "lucide-react";
```

Import/upload button:

```ts
import { Upload } from "lucide-react";
```

Add:

```ts
import { Plus } from "lucide-react";
```

### Icon Rules

- Keep icon size consistent.
- Prefer `size={18}` or Tailwind size classes.
- Icons should support text, not replace important text.
- Buttons should still have readable labels where possible.

Example:

```tsx
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AddProgramButton() {
  return (
    <Button>
      <Plus size={18} />
      Add Program
    </Button>
  );
}
```

---

## 5. axios API Client

Wellspring uses axios for frontend API calls.

Auth uses HTTP-only cookies, so every authenticated request must send credentials.

### Shared API Client

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});
```

Keep this in:

```txt
frontend/lib/api.ts
```

### Rules

- Do not manually attach JWT from localStorage.
- Do not store auth token in frontend storage.
- Use `withCredentials: true`.
- Handle `{ success, data, error }` response shape.
- Keep feature API functions near the feature if needed.

Example:

```ts
export async function getPrograms() {
  const response = await api.get("/programs");
  return response.data;
}
```

---

## 6. CSV Import Libraries

Wellspring uses CSV import for bulk session creation.

### Libraries

```txt
multer
csv-parse
zod
```

### Usage

```txt
multer     receives uploaded CSV file
csv-parse  parses CSV text into rows
zod        validates parsed row data
```

### Rules

- CSV import is only for sessions.
- CSV import happens from the Program Detail Page.
- Backend must verify the program belongs to the logged-in creator.
- Do not accept `creatorId` from CSV.
- Do not accept `programId` from CSV.
- `programId` comes from the route.
- `creatorId` comes from auth cookie.
- Validate every row before inserting.
- Return row-level validation errors.
- Support idempotency using `clientImportId`.

CSV endpoint:

```txt
POST /programs/:programId/sessions/import
```

---

## 7. Prisma Client

Wellspring uses Prisma Client for database access.

With Prisma v7 style, Prisma Client is generated into the backend source folder.

### Import Pattern

```ts
import { PrismaClient } from "../generated/prisma/client";
```

Use the shared Prisma client:

```txt
backend/src/lib/prisma.ts
```

Do not create a new Prisma client in every file.

### Rules

- Repository files should contain Prisma queries.
- Every tenant-owned query must include `creatorId`.
- Use migrations for schema changes.
- Commit migration files.
- Do not commit generated Prisma client files.
- Run `npx prisma generate` after schema changes.

Ignore generated client:

```txt
backend/src/generated/prisma/
```

Commit:

```txt
backend/prisma/schema.prisma
backend/prisma.config.ts
backend/prisma/migrations/
backend/prisma/seed.ts
```

---

## 8. Library Installation Timing

Do not install all libraries at once unless required.

Install only when the phase needs it.

Recommended timing:

```txt
Foundation/Auth/Programs:
axios
lucide-react

CSV Import phase:
multer
csv-parse

S3 Upload phase:
@aws-sdk/client-s3
@aws-sdk/s3-request-presigner

Drag and Drop phase:
@dnd-kit/core
@dnd-kit/sortable
@dnd-kit/utilities
```

This keeps the project clean and avoids unused dependencies.
