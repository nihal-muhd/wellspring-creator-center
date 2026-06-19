import {
  AuditAction,
  TargetEntity,
  type Prisma,
} from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { createAuditLog } from "../audit/audit.repository";
import type {
  CreateProgramInput,
  UpdateProgramInput,
} from "./programs.schema";

const programSelect = {
  id: true,
  title: true,
  description: true,
  coverImageUrl: true,
  coverImageKey: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      sessions: true,
    },
  },
} as const;

export async function findProgramsForCreator(creatorId: string) {
  return prisma.program.findMany({
    where: {
      creatorId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: programSelect,
  });
}

export async function findProgramByIdForCreator(
  programId: string,
  creatorId: string,
) {
  return prisma.program.findFirst({
    where: {
      id: programId,
      creatorId,
    },
    select: programSelect,
  });
}

export async function createProgramForCreator(
  creatorId: string,
  actorId: string,
  input: CreateProgramInput,
) {
  return prisma.$transaction(async (transaction) => {
    const program = await transaction.program.create({
      data: {
        creatorId,
        title: input.title,
        description: input.description,
        coverImageUrl: input.coverImageUrl,
        coverImageKey: input.coverImageKey,
      },
      select: programSelect,
    });

    await createAuditLog(transaction, {
      creatorId,
      actorId,
      action: AuditAction.PROGRAM_CREATED,
      targetEntity: TargetEntity.PROGRAM,
      targetId: program.id,
      metadata: {
        title: program.title,
        hasDescription: Boolean(program.description),
        hasCoverImage: Boolean(program.coverImageUrl),
      },
    });

    return program;
  });
}

export async function updateProgramForCreator(
  programId: string,
  creatorId: string,
  actorId: string,
  input: UpdateProgramInput,
) {
  return prisma.$transaction(async (transaction) => {
    const existingProgram = await transaction.program.findFirst({
      where: {
        id: programId,
        creatorId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        coverImageUrl: true,
        coverImageKey: true,
      },
    });

    if (!existingProgram) {
      return null;
    }

    const result = await transaction.program.updateMany({
      where: {
        id: programId,
        creatorId,
      },
      data: input,
    });

    if (result.count === 0) {
      return null;
    }

    const program = await transaction.program.findFirst({
      where: {
        id: programId,
        creatorId,
      },
      select: programSelect,
    });

    if (!program) {
      return null;
    }

    const changes = buildProgramChanges(existingProgram, program, input);

    await createAuditLog(transaction, {
      creatorId,
      actorId,
      action: AuditAction.PROGRAM_UPDATED,
      targetEntity: TargetEntity.PROGRAM,
      targetId: program.id,
      metadata: {
        title: program.title,
        changes,
      },
    });

    return program;
  });
}

export async function deleteProgramForCreator(
  programId: string,
  creatorId: string,
  actorId: string,
) {
  return prisma.$transaction(async (transaction) => {
    const program = await transaction.program.findFirst({
      where: {
        id: programId,
        creatorId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        coverImageUrl: true,
        coverImageKey: true,
        sessions: {
          select: {
            mediaKey: true,
          },
        },
        _count: {
          select: {
            sessions: true,
          },
        },
      },
    });

    if (!program) {
      return null;
    }

    const result = await transaction.program.deleteMany({
      where: {
        id: programId,
        creatorId,
      },
    });

    if (result.count === 0) {
      return null;
    }

    await createAuditLog(transaction, {
      creatorId,
      actorId,
      action: AuditAction.PROGRAM_DELETED,
      targetEntity: TargetEntity.PROGRAM,
      targetId: program.id,
      metadata: {
        title: program.title,
        description: program.description,
        coverImageUrl: program.coverImageUrl,
        coverImageKey: program.coverImageKey,
        sessionCount: program._count.sessions,
      },
    });

    return {
      id: program.id,
      deletedFileKeys: [
        program.coverImageKey,
        ...program.sessions.map((session) => session.mediaKey),
      ],
    };
  });
}

type AuditableProgram = {
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  coverImageKey: string | null;
};

type ProgramChanges = Record<
  string,
  {
    from: string | null;
    to: string | null;
  }
>;

function buildProgramChanges(
  before: AuditableProgram,
  after: AuditableProgram,
  input: UpdateProgramInput,
): ProgramChanges {
  const changes: ProgramChanges = {};
  const fields = Object.keys(input) as Array<keyof AuditableProgram>;

  for (const field of fields) {
    if (before[field] !== after[field]) {
      changes[field] = {
        from: before[field],
        to: after[field],
      };
    }
  }

  return changes;
}
