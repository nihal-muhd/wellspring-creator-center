import { findAuditLogsForCreator } from "./audit.repository";
import type { ListAuditLogsQuery } from "./audit.schema";

function startOfUtcDay(value: string | undefined): Date | undefined {
  return value ? new Date(`${value}T00:00:00.000Z`) : undefined;
}

function startOfNextUtcDay(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date;
}

export async function listAuditLogs(
  creatorId: string,
  query: ListAuditLogsQuery,
) {
  return findAuditLogsForCreator({
    creatorId,
    action: query.action,
    startDate: startOfUtcDay(query.startDate),
    endDate: startOfNextUtcDay(query.endDate),
    search: query.search,
    page: query.page,
    limit: query.limit,
  });
}
