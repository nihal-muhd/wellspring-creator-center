import { Writable } from "node:stream";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import request from "supertest";

import { createApp } from "../src/app";
import {
  AuditAction,
  type Creator,
  type Program,
  type Session,
  type User,
} from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn(
    async () => "https://signed-upload.example.test",
  ),
}));

type TestTenant = {
  creator: Pick<Creator, "id">;
  user: Pick<User, "id" | "email">;
  cookie: string;
};

type JsonLog = {
  request_id?: string;
  tenant_id?: string | null;
  msg?: string;
};

type SignedUrlMock = {
  mockClear: () => void;
  mock: {
    calls: Array<
      [unknown, unknown, { expiresIn: number } | undefined]
    >;
  };
};

class LogCaptureStream extends Writable {
  readonly lines: string[] = [];

  override _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    this.lines.push(chunk.toString("utf8"));
    callback();
  }

  readLogs(): JsonLog[] {
    return this.lines
      .flatMap((line) => line.split("\n"))
      .filter(Boolean)
      .map((line) => JSON.parse(line) as JsonLog);
  }
}

const discardedLogs = new LogCaptureStream();
const app = createApp({
  requestLogStream: discardedLogs,
});
const runId = `phase8-${Date.now()}-${Math.random()
  .toString(36)
  .slice(2, 10)}`;
const createdCreatorIds: string[] = [];

let tenantA: TestTenant;
let tenantB: TestTenant;
let tenantBProgram: Program;
let tenantBSession: Session;

function getCookie(response: request.Response): string {
  const setCookie = response.headers["set-cookie"] as
    | string[]
    | string
    | undefined;
  const cookieHeader = Array.isArray(setCookie)
    ? setCookie[0]
    : setCookie;

  if (!cookieHeader) {
    throw new Error("Expected the response to set an auth cookie.");
  }

  return cookieHeader.split(";")[0];
}

async function createTenant(label: string): Promise<TestTenant> {
  const response = await request(app).post("/auth/signup").send({
    workspaceName: `${runId}-${label}`,
    fullName: `Phase Eight ${label}`,
    email: `${runId}-${label}@example.test`,
    password: "Phase8Password!",
  });

  expect(response.status).toBe(201);

  const tenant = {
    creator: response.body.data.creator as Pick<Creator, "id">,
    user: response.body.data.user as Pick<User, "id" | "email">,
    cookie: getCookie(response),
  };

  createdCreatorIds.push(tenant.creator.id);

  return tenant;
}

async function createProgram(
  tenant: TestTenant,
  title: string,
): Promise<Program> {
  const response = await request(app)
    .post("/programs")
    .set("Cookie", tenant.cookie)
    .send({
      title,
      description: "Phase 8 integration fixture",
    });

  expect(response.status).toBe(201);

  return response.body.data as Program;
}

async function createSession(
  tenant: TestTenant,
  programId: string,
  title: string,
): Promise<Session> {
  const response = await request(app)
    .post(`/programs/${programId}/sessions`)
    .set("Cookie", tenant.cookie)
    .send({
      title,
      duration: 30,
      instructorName: "Phase Eight",
      tags: ["quality"],
      mediaType: null,
      mediaUrl: null,
      mediaKey: null,
    });

  expect(response.status).toBe(201);

  return response.body.data as Session;
}

beforeAll(async () => {
  tenantA = await createTenant("tenant-a");
  tenantB = await createTenant("tenant-b");
  tenantBProgram = await createProgram(
    tenantB,
    `${runId} Tenant B Program`,
  );
  tenantBSession = await createSession(
    tenantB,
    tenantBProgram.id,
    `${runId} Tenant B Session`,
  );
});

afterAll(async () => {
  if (createdCreatorIds.length > 0) {
    await prisma.creator.deleteMany({
      where: {
        id: {
          in: createdCreatorIds,
        },
      },
    });
  }

  await prisma.$disconnect();
});

describe("Phase 8 quality guarantees", () => {
  test("rejects cross-tenant program access", async () => {
    const readResponse = await request(app)
      .get(`/programs/${tenantBProgram.id}`)
      .set("Cookie", tenantA.cookie);

    expect(readResponse.status).toBe(404);
    expect(readResponse.body).toEqual({
      success: false,
      error: "Program not found.",
    });

    const updateResponse = await request(app)
      .patch(`/programs/${tenantBProgram.id}`)
      .set("Cookie", tenantA.cookie)
      .send({
        creatorId: tenantB.creator.id,
        title: "Forged cross-tenant update",
      });

    expect(updateResponse.status).toBe(404);

    const persistedProgram = await prisma.program.findFirst({
      where: {
        id: tenantBProgram.id,
        creatorId: tenantB.creator.id,
      },
    });

    expect(persistedProgram?.title).toBe(tenantBProgram.title);
  });

  test("rejects cross-tenant session access", async () => {
    const response = await request(app)
      .patch(`/sessions/${tenantBSession.id}`)
      .set("Cookie", tenantA.cookie)
      .send({
        creatorId: tenantB.creator.id,
        title: "Forged cross-tenant session update",
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: "Session not found.",
    });

    const persistedSession = await prisma.session.findFirst({
      where: {
        id: tenantBSession.id,
        creatorId: tenantB.creator.id,
      },
    });

    expect(persistedSession?.title).toBe(tenantBSession.title);
  });

  test("rejects cross-tenant audit log access", async () => {
    const response = await request(app)
      .get("/audit-logs")
      .query({
        creatorId: tenantB.creator.id,
        search: tenantBProgram.id,
        limit: 50,
      })
      .set("Cookie", tenantA.cookie);

    expect(response.status).toBe(200);
    expect(response.body.data.items).toEqual([]);

    const tenantBAuditCount = await prisma.auditLog.count({
      where: {
        creatorId: tenantB.creator.id,
        targetId: tenantBProgram.id,
      },
    });

    expect(tenantBAuditCount).toBeGreaterThan(0);
  });

  test("does not duplicate sessions for repeated clientImportId", async () => {
    const program = await createProgram(
      tenantA,
      `${runId} Idempotency Program`,
    );
    const clientImportId = `${runId}-client-import`;
    const csv = [
      "title,duration,instructorName,tags,mediaType",
      "Breathing Reset,0.5,Phase Eight,breath|calm,AUDIO",
      "Evening Unwind,1,Phase Eight,sleep|calm,VIDEO",
    ].join("\n");

    const firstResponse = await request(app)
      .post(`/programs/${program.id}/sessions/import`)
      .set("Cookie", tenantA.cookie)
      .field("clientImportId", clientImportId)
      .attach("file", Buffer.from(csv), {
        filename: "sessions.csv",
        contentType: "text/csv",
      });
    const secondResponse = await request(app)
      .post(`/programs/${program.id}/sessions/import`)
      .set("Cookie", tenantA.cookie)
      .field("clientImportId", clientImportId)
      .attach("file", Buffer.from(csv), {
        filename: "sessions.csv",
        contentType: "text/csv",
      });

    expect(firstResponse.status).toBe(200);
    expect(firstResponse.body.data).toMatchObject({
      importedCount: 2,
      failedCount: 0,
      idempotentReplay: false,
    });
    expect(secondResponse.status).toBe(200);
    expect(secondResponse.body.data).toMatchObject({
      importedCount: 2,
      failedCount: 0,
      idempotentReplay: true,
    });
    expect(secondResponse.body.data.sessions).toEqual(
      firstResponse.body.data.sessions,
    );

    const [sessionCount, importCount, importAuditCount] =
      await Promise.all([
        prisma.session.count({
          where: {
            creatorId: tenantA.creator.id,
            programId: program.id,
          },
        }),
        prisma.bulkImport.count({
          where: {
            creatorId: tenantA.creator.id,
            clientImportId,
          },
        }),
        prisma.auditLog.count({
          where: {
            creatorId: tenantA.creator.id,
            action: AuditAction.BULK_IMPORT_CREATED,
            metadata: {
              path: ["programId"],
              equals: program.id,
            },
          },
        }),
      ]);

    expect(sessionCount).toBe(2);
    expect(importCount).toBe(1);
    expect(importAuditCount).toBe(1);
  });

  test("creates tenant-scoped presigned upload key", async () => {
    const program = await createProgram(
      tenantA,
      `${runId} Upload Program`,
    );
    const mockedGetSignedUrl =
      getSignedUrl as unknown as SignedUrlMock;
    mockedGetSignedUrl.mockClear();

    const response = await request(app)
      .post("/uploads/presign")
      .set("Cookie", tenantA.cookie)
      .send({
        uploadType: "SESSION_MEDIA",
        programId: program.id,
        fileName: "meditation.mp3",
        contentType: "audio/mpeg",
        fileSize: 1024,
      });

    expect(response.status).toBe(201);
    expect(response.body.data.fileKey).toMatch(
      new RegExp(
        `^creators/${tenantA.creator.id}/programs/${program.id}/sessions/[0-9a-f-]+\\.mp3$`,
      ),
    );
    expect(response.body.data.expiresIn).toBe(300);
    expect(mockedGetSignedUrl).toHaveBeenCalledTimes(1);
    expect(mockedGetSignedUrl.mock.calls[0]?.[2]).toEqual({
      expiresIn: 300,
    });

    const crossTenantResponse = await request(app)
      .post("/uploads/presign")
      .set("Cookie", tenantA.cookie)
      .send({
        uploadType: "SESSION_MEDIA",
        programId: tenantBProgram.id,
        fileName: "forged.mp3",
        contentType: "audio/mpeg",
        fileSize: 1024,
      });

    expect(crossTenantResponse.status).toBe(404);
    expect(mockedGetSignedUrl).toHaveBeenCalledTimes(1);
  });

  test("sets access_token as an HTTP-only cookie", async () => {
    const response = await request(app).post("/auth/login").send({
      email: tenantA.user.email,
      password: "Phase8Password!",
    });
    const setCookie = response.headers["set-cookie"] as
      | string[]
      | string
      | undefined;
    const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;

    expect(response.status).toBe(200);
    expect(cookie).toContain("access_token=");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).not.toContain("Domain=");
  });

  test("writes structured request logs with request_id and tenant_id", async () => {
    const logStream = new LogCaptureStream();
    const loggedApp = createApp({
      requestLogStream: logStream,
    });
    const authenticatedRequestId = `${runId}-authenticated-log`;
    const publicRequestId = `${runId}-public-log`;

    await request(loggedApp)
      .get("/programs")
      .set("Cookie", tenantA.cookie)
      .set("x-request-id", authenticatedRequestId)
      .expect(200);
    await request(loggedApp)
      .get("/health")
      .set("x-request-id", publicRequestId)
      .expect(200);
    await new Promise<void>((resolve) => setImmediate(resolve));

    const requestLogs = logStream
      .readLogs()
      .filter(
        (log) =>
          log.request_id === authenticatedRequestId ||
          log.request_id === publicRequestId,
      );

    expect(requestLogs).toHaveLength(2);
    expect(requestLogs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          request_id: authenticatedRequestId,
          tenant_id: tenantA.creator.id,
          msg: "request completed",
        }),
        expect.objectContaining({
          request_id: publicRequestId,
          tenant_id: null,
          msg: "request completed",
        }),
      ]),
    );
    expect(
      requestLogs.every(
        (log) =>
          Object.hasOwn(log, "request_id") &&
          Object.hasOwn(log, "tenant_id"),
      ),
    ).toBe(true);
  });
});
