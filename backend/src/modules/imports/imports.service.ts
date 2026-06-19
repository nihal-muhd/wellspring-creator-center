import { parse } from "csv-parse/sync";

import { AppError } from "../../lib/app-error";
import {
  importSessionRowSchema,
  type ImportRowError,
  type ValidImportRow,
} from "./imports.schema";
import { importSessionsForCreator } from "./imports.repository";

const csvColumns = [
  "title",
  "duration",
  "position",
  "instructorName",
  "tags",
  "mediaType",
  "mediaUrl",
] as const;
const requiredColumns = ["title", "duration"] as const;

type ParsedCsvRecord = {
  info: {
    lines: number;
  };
  record: string[];
};

function parseCsvFile(file: Express.Multer.File): {
  rows: ValidImportRow[];
  errors: ImportRowError[];
} {
  let records: ParsedCsvRecord[];

  try {
    records = parse(file.buffer, {
      bom: true,
      info: true,
      relax_column_count: true,
      skip_empty_lines: true,
      trim: true,
    }) as unknown as ParsedCsvRecord[];
  } catch {
    throw new AppError(
      "The CSV file could not be parsed. Check its formatting and try again.",
      400,
    );
  }

  if (records.length === 0) {
    throw new AppError("The CSV file is empty.", 400);
  }

  const headers = records[0].record.map((header) => header.trim());
  const duplicateHeaders = headers.filter(
    (header, index) => headers.indexOf(header) !== index,
  );
  const unsupportedHeaders = headers.filter(
    (header) => !csvColumns.includes(header as (typeof csvColumns)[number]),
  );
  const missingHeaders = requiredColumns.filter(
    (header) => !headers.includes(header),
  );

  if (duplicateHeaders.length > 0) {
    throw new AppError("CSV column names must not be duplicated.", 400);
  }

  if (unsupportedHeaders.length > 0) {
    throw new AppError(
      `Unsupported CSV column: ${unsupportedHeaders[0]}.`,
      400,
    );
  }

  if (missingHeaders.length > 0) {
    throw new AppError(
      `Missing required CSV column: ${missingHeaders[0]}.`,
      400,
    );
  }

  const rows: ValidImportRow[] = [];
  const errors: ImportRowError[] = [];

  records.slice(1).forEach((parsedRecord, sourceIndex) => {
    const rowNumber = parsedRecord.info.lines;

    if (parsedRecord.record.length !== headers.length) {
      errors.push({
        row: rowNumber,
        message: `Expected ${headers.length} columns but received ${parsedRecord.record.length}.`,
      });
      return;
    }

    const rawRow = Object.fromEntries(
      headers.map((header, index) => [header, parsedRecord.record[index] ?? ""]),
    );
    const parsedRow = importSessionRowSchema.safeParse({
      title: rawRow.title ?? "",
      duration: rawRow.duration ?? "",
      position: rawRow.position ?? "",
      instructorName: rawRow.instructorName ?? "",
      tags: rawRow.tags ?? "",
      mediaType: rawRow.mediaType ?? "",
      mediaUrl: rawRow.mediaUrl ?? "",
    });

    if (!parsedRow.success) {
      parsedRow.error.issues.forEach((issue) => {
        errors.push({
          row: rowNumber,
          field:
            typeof issue.path[0] === "string" ? issue.path[0] : undefined,
          message: issue.message,
        });
      });
      return;
    }

    rows.push({
      ...parsedRow.data,
      row: rowNumber,
      sourceIndex,
    });
  });

  rows.sort((left, right) => {
    if (left.position === null && right.position === null) {
      return left.sourceIndex - right.sourceIndex;
    }

    if (left.position === null) {
      return 1;
    }

    if (right.position === null) {
      return -1;
    }

    return left.position - right.position || left.sourceIndex - right.sourceIndex;
  });

  return { rows, errors };
}

export async function importProgramSessions(
  programId: string,
  creatorId: string,
  actorId: string,
  clientImportId: string,
  file?: Express.Multer.File,
) {
  if (!file) {
    throw new AppError("Choose a CSV file.", 400);
  }

  const { rows, errors } = parseCsvFile(file);
  const result = await importSessionsForCreator(
    programId,
    creatorId,
    actorId,
    clientImportId,
    rows,
    errors,
  );

  if (result.status === "program-not-found") {
    throw new AppError("Program not found.", 404);
  }

  if (result.status === "id-used-for-another-program") {
    throw new AppError(
      "This import ID has already been used for another program.",
      409,
    );
  }

  return result.result;
}
