"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  CloudUpload,
  FileUp,
  ListRestart,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AuditLogDetailModal } from "@/components/audit-logs/AuditLogDetailModal";
import {
  getAuditLogs,
  getAuditLogsErrorMessage,
  isUnauthorizedAuditLogError,
} from "@/lib/audit-logs/audit-logs";
import {
  auditActions,
  type AuditAction,
  type AuditLogPage,
  type AuditLogRecord,
} from "@/types/audit-log";

const PAGE_SIZE = 10;

const actionDetails: Record<
  AuditAction,
  { label: string; icon: LucideIcon }
> = {
  PROGRAM_CREATED: { label: "Program Created", icon: CirclePlus },
  PROGRAM_UPDATED: { label: "Program Updated", icon: Pencil },
  PROGRAM_DELETED: { label: "Program Deleted", icon: Trash2 },
  SESSION_CREATED: { label: "Session Created", icon: CirclePlus },
  SESSION_UPDATED: { label: "Session Updated", icon: Pencil },
  SESSION_DELETED: { label: "Session Deleted", icon: Trash2 },
  SESSION_REORDERED: { label: "Sessions Reordered", icon: ListRestart },
  BULK_IMPORT_CREATED: { label: "Import Completed", icon: FileUp },
  UPLOAD_URL_REQUESTED: { label: "Upload Requested", icon: CloudUpload },
};

const initialPage: AuditLogPage = {
  items: [],
  pagination: {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  },
};

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.min(
    Math.max(currentPage - 2, 1),
    Math.max(totalPages - 4, 1),
  );

  return Array.from({ length: 5 }, (_, index) => start + index);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ActionIcon({ action }: { action: AuditAction }) {
  const Icon = actionDetails[action].icon;
  const isDestructive =
    action === "PROGRAM_DELETED" || action === "SESSION_DELETED";

  return (
    <span
      className={[
        "inline-flex size-10 shrink-0 items-center justify-center rounded-md",
        isDestructive
          ? "bg-error-container text-error"
          : "bg-primary-fixed text-on-primary-fixed-variant",
      ].join(" ")}
    >
      <Icon aria-hidden="true" size={19} strokeWidth={1.75} />
    </span>
  );
}

export function AuditLogsPageContent() {
  const router = useRouter();
  const [auditPage, setAuditPage] = useState<AuditLogPage>(initialPage);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [action, setAction] = useState<AuditAction | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(
    null,
  );

  const handleUnauthorized = useCallback(
    (error: unknown): boolean => {
      if (!isUnauthorizedAuditLogError(error)) {
        return false;
      }

      router.replace("/login");
      router.refresh();
      return true;
    },
    [router],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
      setDebouncedSearch(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    let isActive = true;

    getAuditLogs({
      action: action || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: debouncedSearch || undefined,
      page,
      limit: PAGE_SIZE,
    })
      .then((result) => {
        if (isActive) {
          setAuditPage(result);
        }
      })
      .catch((error: unknown) => {
        if (isActive && !handleUnauthorized(error)) {
          setLoadError(getAuditLogsErrorMessage(error));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [
    action,
    debouncedSearch,
    endDate,
    handleUnauthorized,
    page,
    retryCount,
    startDate,
  ]);

  const visiblePages = useMemo(
    () =>
      getVisiblePages(
        auditPage.pagination.page,
        auditPage.pagination.totalPages,
      ),
    [auditPage.pagination.page, auditPage.pagination.totalPages],
  );

  const hasFilters = Boolean(
    searchQuery || action || startDate || endDate,
  );
  const firstResult =
    auditPage.pagination.total === 0
      ? 0
      : (auditPage.pagination.page - 1) * PAGE_SIZE + 1;
  const lastResult = Math.min(
    auditPage.pagination.page * PAGE_SIZE,
    auditPage.pagination.total,
  );

  function resetFilters(): void {
    setIsLoading(true);
    setLoadError("");
    setSearchQuery("");
    setDebouncedSearch("");
    setAction("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }

  return (
    <main className="min-h-dvh bg-background">
      <div className="border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8">
        <label className="relative block max-w-lg">
          <span className="sr-only">Search audit logs</span>
          <Search
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline"
            size={18}
            strokeWidth={1.75}
          />
          <input
            className="w-full rounded-full border border-transparent bg-muted py-2.5 pl-11 pr-4 text-label-md text-foreground outline-none placeholder:text-outline focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed"
            onChange={(event) => {
              const nextSearch = event.target.value;

              if (nextSearch.trim() !== debouncedSearch) {
                setIsLoading(true);
                setLoadError("");
              }

              setSearchQuery(nextSearch);
            }}
            placeholder="Search audit trails..."
            type="search"
            value={searchQuery}
          />
        </label>
      </div>

      <div className="mx-auto w-full max-w-app px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
        <header>
          <h1 className="text-headline-md text-primary">Audit Logs</h1>
          <p className="mt-1 text-label-md text-muted-foreground">
            Track administrative changes and content activity across your
            workspace.
          </p>
        </header>

        <section
          aria-label="Audit log filters"
          className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card sm:p-6"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(14rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_auto] xl:items-end">
            <label>
              <span className="text-label-sm uppercase tracking-wide text-muted-foreground">
                Action type
              </span>
              <select
                className="mt-2 w-full rounded-md border border-transparent bg-muted px-4 py-2.5 text-label-md text-foreground outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed"
                onChange={(event) => {
                  setIsLoading(true);
                  setLoadError("");
                  setAction(event.target.value as AuditAction | "");
                  setPage(1);
                }}
                value={action}
              >
                <option value="">All actions</option>
                {auditActions.map((item) => (
                  <option key={item} value={item}>
                    {actionDetails[item].label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-label-sm uppercase tracking-wide text-muted-foreground">
                Start date
              </span>
              <span className="relative mt-2 block">
                <CalendarDays
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-outline"
                  size={18}
                  strokeWidth={1.75}
                />
                <input
                  className="w-full rounded-md border border-transparent bg-muted py-2.5 pl-11 pr-4 text-label-md text-foreground outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed"
                  max={endDate || undefined}
                  onChange={(event) => {
                    setIsLoading(true);
                    setLoadError("");
                    setStartDate(event.target.value);
                    setPage(1);
                  }}
                  type="date"
                  value={startDate}
                />
              </span>
            </label>

            <label>
              <span className="text-label-sm uppercase tracking-wide text-muted-foreground">
                End date
              </span>
              <span className="relative mt-2 block">
                <CalendarDays
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-outline"
                  size={18}
                  strokeWidth={1.75}
                />
                <input
                  className="w-full rounded-md border border-transparent bg-muted py-2.5 pl-11 pr-4 text-label-md text-foreground outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed"
                  min={startDate || undefined}
                  onChange={(event) => {
                    setIsLoading(true);
                    setLoadError("");
                    setEndDate(event.target.value);
                    setPage(1);
                  }}
                  type="date"
                  value={endDate}
                />
              </span>
            </label>

            <button
              className="rounded-md border border-border bg-card px-4 py-2.5 text-label-md font-semibold text-primary transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!hasFilters}
              onClick={resetFilters}
              type="button"
            >
              Reset Filters
            </button>
          </div>
        </section>

        {loadError ? (
          <section className="mt-6 rounded-xl border border-border bg-card p-6 text-center shadow-card">
            <p className="text-label-md text-error" role="alert">
              {loadError}
            </p>
            <button
              className="mt-4 rounded-md bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              onClick={() => {
                setIsLoading(true);
                setLoadError("");
                setRetryCount((count) => count + 1);
              }}
              type="button"
            >
              Try Again
            </button>
          </section>
        ) : (
          <section
            aria-busy={isLoading}
            aria-label="Audit log activity"
            className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-card"
          >
            {isLoading ? (
              <div aria-label="Loading audit logs" className="divide-y divide-border">
                {Array.from({ length: 5 }, (_, index) => (
                  <div
                    className="grid animate-pulse gap-4 px-5 py-5 motion-reduce:animate-none md:grid-cols-[1.2fr_1fr_1fr_5rem] md:items-center"
                    key={index}
                  >
                    <div className="h-5 w-2/3 rounded-md bg-surface-container" />
                    <div className="h-5 w-3/4 rounded-md bg-surface-container" />
                    <div className="h-5 w-1/2 rounded-md bg-surface-container" />
                    <div className="h-5 w-12 rounded-md bg-surface-container" />
                  </div>
                ))}
              </div>
            ) : auditPage.items.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <Search
                  aria-hidden="true"
                  className="mx-auto text-outline"
                  size={30}
                  strokeWidth={1.5}
                />
                <h2 className="mt-3 text-lg font-semibold text-foreground">
                  {hasFilters ? "No audit logs found" : "No activity yet"}
                </h2>
                <p className="mt-1 text-label-md text-muted-foreground">
                  {hasFilters
                    ? "Try changing or resetting your filters."
                    : "Administrative activity will appear here as you manage your workspace."}
                </p>
                {hasFilters ? (
                  <button
                    className="mt-4 rounded-md border border-border bg-card px-4 py-2.5 text-label-md font-semibold text-primary transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    onClick={resetFilters}
                    type="button"
                  >
                    Reset Filters
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <div className="grid grid-cols-[1.2fr_1fr_1fr_5rem] gap-4 bg-muted px-6 py-4 text-label-sm uppercase tracking-wide text-muted-foreground">
                    <span>Action</span>
                    <span>Performed by</span>
                    <span>Date/time</span>
                    <span>Details</span>
                  </div>
                  <ul className="divide-y divide-border">
                    {auditPage.items.map((log) => (
                      <li
                        className="grid grid-cols-[1.2fr_1fr_1fr_5rem] items-center gap-4 px-6 py-5 transition-colors hover:bg-muted"
                        key={log.id}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <ActionIcon action={log.action} />
                          <div className="min-w-0">
                            <p className="truncate text-body-md text-foreground">
                              {actionDetails[log.action].label}
                            </p>
                            <p className="mt-0.5 truncate text-label-sm text-muted-foreground">
                              {log.targetEntity.replaceAll("_", " ")}
                            </p>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-label-md text-foreground">
                            {log.actor.email}
                          </p>
                          <p className="mt-0.5 text-label-sm text-muted-foreground">
                            {log.actor.role === "OWNER" ? "Owner" : "Admin"}
                          </p>
                        </div>
                        <time
                          className="text-label-md text-muted-foreground"
                          dateTime={log.createdAt}
                        >
                          {formatDateTime(log.createdAt)}
                        </time>
                        <button
                          className="justify-self-start rounded-md px-2 py-1.5 text-label-md font-semibold text-primary transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          onClick={() => setSelectedLog(log)}
                          type="button"
                        >
                          View
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <ul className="divide-y divide-border md:hidden">
                  {auditPage.items.map((log) => (
                    <li className="p-5" key={log.id}>
                      <div className="flex items-start gap-3">
                        <ActionIcon action={log.action} />
                        <div className="min-w-0 flex-1">
                          <p className="text-body-md text-foreground">
                            {actionDetails[log.action].label}
                          </p>
                          <p className="mt-1 break-all text-label-md text-muted-foreground">
                            {log.actor.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-4">
                        <time
                          className="text-label-sm text-muted-foreground"
                          dateTime={log.createdAt}
                        >
                          {formatDateTime(log.createdAt)}
                        </time>
                        <button
                          className="rounded-md px-2 py-1.5 text-label-md font-semibold text-primary transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          onClick={() => setSelectedLog(log)}
                          type="button"
                        >
                          View details
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <footer className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p
                    aria-live="polite"
                    className="text-label-sm text-muted-foreground"
                  >
                    Showing {firstResult} to {lastResult} of{" "}
                    {auditPage.pagination.total} actions
                  </p>
                  <nav
                    aria-label="Audit log pagination"
                    className="flex items-center gap-1"
                  >
                    <button
                      aria-label="Previous page"
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={page <= 1}
                      onClick={() => {
                        setIsLoading(true);
                        setPage((current) => current - 1);
                      }}
                      type="button"
                    >
                      <ChevronLeft aria-hidden="true" size={18} />
                    </button>
                    {visiblePages.map((pageNumber) => (
                      <button
                        aria-current={
                          pageNumber === page ? "page" : undefined
                        }
                        aria-label={`Page ${pageNumber}`}
                        className={[
                          "min-w-9 rounded-md px-3 py-2 text-label-md font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                          pageNumber === page
                            ? "bg-primary text-on-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-primary",
                        ].join(" ")}
                        key={pageNumber}
                        onClick={() => {
                          setIsLoading(true);
                          setPage(pageNumber);
                        }}
                        type="button"
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      aria-label="Next page"
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={page >= auditPage.pagination.totalPages}
                      onClick={() => {
                        setIsLoading(true);
                        setPage((current) => current + 1);
                      }}
                      type="button"
                    >
                      <ChevronRight aria-hidden="true" size={18} />
                    </button>
                  </nav>
                </footer>
              </>
            )}
          </section>
        )}
      </div>

      {selectedLog ? (
        <AuditLogDetailModal
          actionLabel={actionDetails[selectedLog.action].label}
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      ) : null}
    </main>
  );
}
