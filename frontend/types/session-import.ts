import type { SessionApiRecord } from "@/types/session";

export type SessionImportRowError = {
  row: number;
  field?: string;
  message: string;
};

export type SessionImportResult = {
  importedCount: number;
  failedCount: number;
  errors: SessionImportRowError[];
  sessions: SessionApiRecord[];
  idempotentReplay: boolean;
};
