import {
  AuditAction,
  type Prisma,
  TargetEntity,
} from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

type AuditTransaction = Prisma.TransactionClient;

type CreateAuditLogInput = {
  creatorId: string;
  actorId: string;
  action: AuditAction;
  targetEntity: TargetEntity;
  targetId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export async function createAuditLog(
  transaction: AuditTransaction,
  input: CreateAuditLogInput,
) {
  return transaction.auditLog.create({
    data: {
      creatorId: input.creatorId,
      actorId: input.actorId,
      action: input.action,
      targetEntity: input.targetEntity,
      targetId: input.targetId,
      metadata: input.metadata,
    },
  });
}

type FindAuditLogsInput = {
  creatorId: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page: number;
  limit: number;
};

const auditLogSelect = {
  id: true,
  action: true,
  targetEntity: true,
  targetId: true,
  metadata: true,
  createdAt: true,
  actor: {
    select: {
      id: true,
      email: true,
      role: true,
    },
  },
} as const;

const auditActions = Object.values(AuditAction);
const targetEntities = Object.values(TargetEntity);

function buildAuditLogWhere(
  input: FindAuditLogsInput,
): Prisma.AuditLogWhereInput {
  const normalizedSearch = input.search?.trim().toLowerCase();
  const matchingActions = normalizedSearch
    ? auditActions.filter((action) =>
        action.toLowerCase().replaceAll("_", " ").includes(normalizedSearch),
      )
    : [];
  const matchingTargets = normalizedSearch
    ? targetEntities.filter((target) =>
        target.toLowerCase().replaceAll("_", " ").includes(normalizedSearch),
      )
    : [];

  return {
    creatorId: input.creatorId,
    action: input.action,
    createdAt:
      input.startDate || input.endDate
        ? {
            gte: input.startDate,
            lt: input.endDate,
          }
        : undefined,
    OR: normalizedSearch
      ? [
          {
            actor: {
              email: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
          },
          {
            targetId: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
          ...(matchingActions.length > 0
            ? [
                {
                  action: {
                    in: matchingActions,
                  },
                },
              ]
            : []),
          ...(matchingTargets.length > 0
            ? [
                {
                  targetEntity: {
                    in: matchingTargets,
                  },
                },
              ]
            : []),
        ]
      : undefined,
  };
}

export async function findAuditLogsForCreator(input: FindAuditLogsInput) {
  const where = buildAuditLogWhere(input);
  const skip = (input.page - 1) * input.limit;
  const [items, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip,
      take: input.limit,
      select: auditLogSelect,
    }),
    prisma.auditLog.count({
      where,
    }),
  ]);

  return {
    items,
    pagination: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.limit)),
    },
  };
}
