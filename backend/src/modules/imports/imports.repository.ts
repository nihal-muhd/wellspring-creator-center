import {
  AuditAction,
  BulkImportStatus,
  TargetEntity,
  type Prisma,
} from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { createAuditLog } from "../audit/audit.repository";
import type {
  ImportRowError,
  ValidImportRow,
} from "./imports.schema";

type StoredImportSession = {
  id: string;
  programId: string;
  title: string;
  duration: number;
  position: number;
  instructorName: string | null;
  tags: string[];
  mediaType: "AUDIO" | "VIDEO" | null;
  mediaUrl: string | null;
  mediaKey: string | null;
  thumbnailUrl: string | null;
};

export type ImportResult = {
  importedCount: number;
  failedCount: number;
  errors: ImportRowError[];
  sessions: StoredImportSession[];
  idempotentReplay: boolean;
};

type StoredImportResult = Omit<ImportResult, "idempotentReplay">;

function asStoredImportResult(value: Prisma.JsonValue): StoredImportResult {
  return value as StoredImportResult;
}

export async function importSessionsForCreator(
  programId: string,
  creatorId: string,
  actorId: string,
  clientImportId: string,
  rows: ValidImportRow[],
  errors: ImportRowError[],
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
      return { status: "program-not-found" as const };
    }

    const existingImport = await transaction.bulkImport.findFirst({
      where: {
        creatorId,
        clientImportId,
      },
      select: {
        programId: true,
        resultJson: true,
      },
    });

    if (existingImport) {
      if (existingImport.programId !== programId) {
        return { status: "id-used-for-another-program" as const };
      }

      return {
        status: "success" as const,
        result: {
          ...asStoredImportResult(existingImport.resultJson),
          idempotentReplay: true,
        },
      };
    }

    const lastSession = await transaction.session.findFirst({
      where: {
        creatorId,
        programId,
      },
      orderBy: {
        position: "desc",
      },
      select: {
        position: true,
      },
    });
    const startingPosition = lastSession?.position ?? 0;
    const sessions: StoredImportSession[] = [];

    for (const [index, row] of rows.entries()) {
      const session = await transaction.session.create({
        data: {
          creatorId,
          programId,
          title: row.title,
          duration: row.duration,
          position: startingPosition + index + 1,
          instructorName: row.instructorName,
          tags: row.tags,
          mediaType: row.mediaType,
          mediaUrl: row.mediaUrl,
        },
        select: {
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
        },
      });

      sessions.push(session);
    }

    const storedResult: StoredImportResult = {
      importedCount: sessions.length,
      failedCount: new Set(errors.map((error) => error.row)).size,
      errors,
      sessions,
    };
    const bulkImport = await transaction.bulkImport.create({
      data: {
        creatorId,
        programId,
        clientImportId,
        status: BulkImportStatus.COMPLETED,
        resultJson: storedResult as Prisma.InputJsonValue,
      },
      select: {
        id: true,
      },
    });

    await createAuditLog(transaction, {
      creatorId,
      actorId,
      action: AuditAction.BULK_IMPORT_CREATED,
      targetEntity: TargetEntity.BULK_IMPORT,
      targetId: bulkImport.id,
      metadata: {
        programId,
        importedCount: sessions.length,
        failedCount: storedResult.failedCount,
      },
    });

    return {
      status: "success" as const,
      result: {
        ...storedResult,
        idempotentReplay: false,
      },
    };
  });
}
