import {
  AuditAction,
  TargetEntity,
} from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { createAuditLog } from "../audit/audit.repository";
import type {
  CreateSessionInput,
  UpdateSessionInput,
} from "./sessions.schema";

const sessionSelect = {
  id: true,
  programId: true,
  title: true,
  duration: true,
  position: true,
  instructorName: true,
  tags: true,
  mediaType: true,
  mediaUrl: true,
  mediaKey: true,
  thumbnailUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function findProgramSessionsForCreator(
  programId: string,
  creatorId: string,
) {
  return prisma.session.findMany({
    where: {
      programId,
      creatorId,
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: sessionSelect,
  });
}

export async function createSessionForCreator(
  programId: string,
  creatorId: string,
  actorId: string,
  input: CreateSessionInput,
) {
  return prisma.$transaction(async (transaction) => {
    const program = await transaction.program.findFirst({
      where: {
        id: programId,
        creatorId,
      },
      select: {
        id: true,
      },
    });

    if (!program) {
      return null;
    }

    const lastSession = await transaction.session.findFirst({
      where: {
        programId,
        creatorId,
      },
      orderBy: {
        position: "desc",
      },
      select: {
        position: true,
      },
    });

    const session = await transaction.session.create({
      data: {
        creatorId,
        programId,
        title: input.title,
        duration: input.duration,
        position: (lastSession?.position ?? 0) + 1,
        instructorName: input.instructorName,
        tags: input.tags,
        mediaType: input.mediaType,
      },
      select: sessionSelect,
    });

    await createAuditLog(transaction, {
      creatorId,
      actorId,
      action: AuditAction.SESSION_CREATED,
      targetEntity: TargetEntity.SESSION,
      targetId: session.id,
      metadata: {
        programId,
        title: session.title,
        duration: session.duration,
        position: session.position,
        mediaType: session.mediaType,
      },
    });

    return session;
  });
}

export async function updateSessionForCreator(
  sessionId: string,
  creatorId: string,
  actorId: string,
  input: UpdateSessionInput,
) {
  return prisma.$transaction(async (transaction) => {
    const existingSession = await transaction.session.findFirst({
      where: {
        id: sessionId,
        creatorId,
      },
      select: sessionSelect,
    });

    if (!existingSession) {
      return null;
    }

    const result = await transaction.session.updateMany({
      where: {
        id: sessionId,
        creatorId,
        programId: existingSession.programId,
      },
      data: input,
    });

    if (result.count === 0) {
      return null;
    }

    const session = await transaction.session.findFirst({
      where: {
        id: sessionId,
        creatorId,
        programId: existingSession.programId,
      },
      select: sessionSelect,
    });

    if (!session) {
      return null;
    }

    const changes = Object.fromEntries(
      Object.keys(input)
        .filter((field) => {
          const key = field as keyof UpdateSessionInput;
          return JSON.stringify(existingSession[key]) !== JSON.stringify(session[key]);
        })
        .map((field) => {
          const key = field as keyof UpdateSessionInput;
          return [
            field,
            {
              from: existingSession[key] ?? null,
              to: session[key] ?? null,
            },
          ];
        }),
    );

    await createAuditLog(transaction, {
      creatorId,
      actorId,
      action: AuditAction.SESSION_UPDATED,
      targetEntity: TargetEntity.SESSION,
      targetId: session.id,
      metadata: {
        programId: session.programId,
        title: session.title,
        changes,
      },
    });

    return session;
  });
}
