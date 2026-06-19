import { AxiosError } from "axios";

import { api } from "@/lib/api";
import type {
  AuditLogApiErrorResponse,
  AuditLogApiSuccessResponse,
  AuditLogFilters,
  AuditLogPage,
} from "@/types/audit-log";

export async function getAuditLogs(
  filters: AuditLogFilters,
): Promise<AuditLogPage> {
  const response = await api.get<AuditLogApiSuccessResponse>(
    "/audit-logs",
    {
      params: {
        action: filters.action,
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.search || undefined,
        page: filters.page,
        limit: filters.limit,
      },
    },
  );

  return response.data.data;
}

export function isUnauthorizedAuditLogError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 401;
}

export function getAuditLogsErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as
      | AuditLogApiErrorResponse
      | undefined;

    if (response?.error) {
      return response.error;
    }
  }

  return "We could not load your audit logs. Please try again.";
}
