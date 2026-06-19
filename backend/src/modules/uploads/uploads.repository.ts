import {
  AuditAction,
  TargetEntity,
  type Prisma,
} from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { createAuditLog } from "../audit/audit.repository";

export async function findUploadProgramForCreator(
  programId: string,
  creatorId: string,
) {
  return prisma.program.findFirst({
    where: {
      id: programId,
      creatorId,
    },
    select: {
      id: true,
    },
  });
}

export async function isFileKeyOwnedByCreator(
  fileKey: string,
  creatorId: string,
): Promise<boolean> {
  const [program, session] = await Promise.all([
    prisma.program.findFirst({
      where: {
        creatorId,
        coverImageKey: fileKey,
      },
      select: {
        id: true,
      },
    }),
    prisma.session.findFirst({
      where: {
        creatorId,
        mediaKey: fileKey,
      },
      select: {
        id: true,
      },
    }),
  ]);

  return Boolean(program || session);
}

export async function createUploadAuditLog(input: {
  creatorId: string;
  actorId: string;
  programId: string;
  uploadType: "PROGRAM_IMAGE" | "SESSION_MEDIA";
  fileKey: string;
  contentType: string;
  fileSize: number;
}) {
  return prisma.$transaction((transaction) =>
    createAuditLog(transaction, {
      creatorId: input.creatorId,
      actorId: input.actorId,
      action: AuditAction.UPLOAD_URL_REQUESTED,
      targetEntity: TargetEntity.UPLOAD,
      targetId: input.programId,
      metadata: {
        programId: input.programId,
        uploadType: input.uploadType,
        fileKey: input.fileKey,
        contentType: input.contentType,
        fileSize: input.fileSize,
      } satisfies Prisma.InputJsonValue,
    }),
  );
}
