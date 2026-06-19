export const auditActions = [
  "PROGRAM_CREATED",
  "PROGRAM_UPDATED",
  "PROGRAM_DELETED",
  "SESSION_CREATED",
  "SESSION_UPDATED",
  "SESSION_DELETED",
  "SESSION_REORDERED",
  "BULK_IMPORT_CREATED",
  "UPLOAD_URL_REQUESTED",
] as const;

export type AuditAction = (typeof auditActions)[number];

export type AuditMetadata =
  | string
  | number
  | boolean
  | null
  | AuditMetadata[]
  | { [key: string]: AuditMetadata };

export type AuditLogRecord = {
  id: string;
  action: AuditAction;
  targetEntity: "PROGRAM" | "SESSION" | "BULK_IMPORT" | "UPLOAD";
  targetId: string | null;
  metadata: AuditMetadata;
  createdAt: string;
  actor: {
    id: string;
    email: string;
    role: "OWNER" | "ADMIN";
  };
};

export type AuditLogPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AuditLogPage = {
  items: AuditLogRecord[];
  pagination: AuditLogPagination;
};

export type AuditLogFilters = {
  action?: AuditAction;
  startDate?: string;
  endDate?: string;
  search?: string;
  page: number;
  limit: number;
};

export type AuditLogApiSuccessResponse = {
  success: true;
  data: AuditLogPage;
};

export type AuditLogApiErrorResponse = {
  success: false;
  error: string;
};
