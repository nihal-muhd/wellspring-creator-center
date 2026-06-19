"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import type {
  AuditLogRecord,
  AuditMetadata,
} from "@/types/audit-log";

type AuditLogDetailModalProps = {
  log: AuditLogRecord;
  actionLabel: string;
  onClose: () => void;
};

function formatKey(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatPrimitive(value: string | number | boolean | null): string {
  if (value === null) {
    return "None";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function MetadataValue({
  value,
  depth = 0,
}: {
  value: AuditMetadata;
  depth?: number;
}) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return (
      <span className="min-w-0 [overflow-wrap:anywhere] text-label-md text-foreground">
        {formatPrimitive(value)}
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-label-md text-muted-foreground">None</span>;
    }

    return (
      <ul className="min-w-0 space-y-2">
        {value.map((item, index) => (
          <li
            className="min-w-0 rounded-md bg-muted px-3 py-2"
            key={index}
          >
            <MetadataValue depth={depth + 1} value={item} />
          </li>
        ))}
      </ul>
    );
  }

  const entries = Object.entries(value);

  if (entries.length === 0) {
    return <span className="text-label-md text-muted-foreground">None</span>;
  }

  return (
    <dl
      className={[
        "min-w-0",
        depth === 0 ? "space-y-3" : "space-y-2",
      ].join(" ")}
    >
      {entries.map(([key, item]) => (
        <div
          className="grid min-w-0 gap-1 rounded-md bg-muted px-3 py-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3"
          key={key}
        >
          <dt className="min-w-0 [overflow-wrap:anywhere] text-label-sm uppercase tracking-wide text-muted-foreground">
            {formatKey(key)}
          </dt>
          <dd className="min-w-0">
            <MetadataValue depth={depth + 1} value={item} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function AuditLogDetailModal({
  log,
  actionLabel,
  onClose,
}: AuditLogDetailModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [onClose]);

  return (
    <div
      aria-labelledby="audit-log-detail-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
    >
      <button
        aria-label="Close audit log details"
        className="absolute inset-0 bg-inverse-surface/35 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <section
        className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card"
        ref={dialogRef}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <p className="text-label-sm uppercase tracking-wide text-muted-foreground">
              Audit log details
            </p>
            <h2
              className="mt-1 [overflow-wrap:anywhere] text-headline-md text-primary"
              id="audit-log-detail-title"
            >
              {actionLabel}
            </h2>
          </div>
          <button
            aria-label="Close audit log details"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <div className="min-w-0 overflow-x-hidden overflow-y-auto px-4 py-4 sm:px-5">
          <dl className="grid min-w-0 gap-3 rounded-xl border border-border bg-card p-3.5 sm:grid-cols-2 sm:p-4">
            <div className="min-w-0">
              <dt className="text-label-sm uppercase tracking-wide text-muted-foreground">
                Performed by
              </dt>
              <dd className="mt-1 min-w-0 [overflow-wrap:anywhere] text-label-md text-foreground">
                {log.actor.email}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-label-sm uppercase tracking-wide text-muted-foreground">
                Date and time
              </dt>
              <dd className="mt-1 text-label-md text-foreground">
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(log.createdAt))}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-label-sm uppercase tracking-wide text-muted-foreground">
                Target
              </dt>
              <dd className="mt-1 text-label-md text-foreground">
                {formatKey(log.targetEntity)}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-label-sm uppercase tracking-wide text-muted-foreground">
                Target ID
              </dt>
              <dd className="mt-1 min-w-0 [overflow-wrap:anywhere] text-label-md text-foreground">
                {log.targetId ?? "Not recorded"}
              </dd>
            </div>
          </dl>

          <section className="mt-4 min-w-0">
            <h3 className="text-lg font-semibold text-foreground">
              Activity details
            </h3>
            <div className="mt-2.5 min-w-0">
              <MetadataValue value={log.metadata ?? {}} />
            </div>
          </section>
        </div>

        <footer className="flex justify-end border-t border-border bg-muted px-4 py-3 sm:px-5">
          <button
            className="rounded-md bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}
