import {
  type AuditAction,
  type Prisma,
  TargetEntity,
} from "../../generated/prisma/client";

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
