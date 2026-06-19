"use client";

import { FileSpreadsheet, FileUp, X } from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import {
  getSessionImportErrorMessage,
  importProgramSessions,
  isUnauthorizedSessionImportError,
} from "@/lib/imports/session-imports";
import type { SessionImportResult } from "@/types/session-import";

type SessionImportModalProps = {
  onImported: () => Promise<void>;
  onClose: () => void;
  onUnauthorized: () => void;
  programId: string;
};

const maxCsvSize = 10 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isCsvFile(file: File): boolean {
  return (
    file.name.toLowerCase().endsWith(".csv") ||
    file.type === "text/csv" ||
    file.type === "application/vnd.ms-excel"
  );
}

export function SessionImportModal({
  onImported,
  onClose,
  onUnauthorized,
  programId,
}: SessionImportModalProps) {
  const titleId = useId();
  const fileErrorId = useId();
  const statusId = useId();
  const modalRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clientImportId, setClientImportId] = useState("");
  const [fileError, setFileError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [result, setResult] = useState<SessionImportResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        if (!isSubmitting) {
          onClose();
        }
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) {
        return;
      }

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose]);

  function selectFile(file?: File): void {
    if (!file) {
      return;
    }

    if (!isCsvFile(file)) {
      setSelectedFile(null);
      setFileError("Choose a CSV file.");
      setRequestError("");
      setResult(null);
      return;
    }

    if (file.size > maxCsvSize) {
      setSelectedFile(null);
      setFileError("Choose a CSV file smaller than 10 MB.");
      setRequestError("");
      setResult(null);
      return;
    }

    setSelectedFile(file);
    setClientImportId(crypto.randomUUID());
    setFileError("");
    setRequestError("");
    setResult(null);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function removeFile(): void {
    setSelectedFile(null);
    setClientImportId("");
    setFileError("");
    setRequestError("");
    setResult(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!selectedFile || !clientImportId) {
      setFileError("Choose a CSV file before importing.");
      return;
    }

    setIsSubmitting(true);
    setRequestError("");

    try {
      const importResult = await importProgramSessions(
        programId,
        selectedFile,
        clientImportId,
      );
      setResult(importResult);
      await onImported();
    } catch (error) {
      if (isUnauthorizedSessionImportError(error)) {
        onUnauthorized();
      } else {
        setRequestError(getSessionImportErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/35 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
    >
      <button
        aria-label="Close CSV import modal"
        className="absolute inset-0 cursor-default"
        disabled={isSubmitting}
        onClick={onClose}
        type="button"
      />

      <section
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card sm:max-h-[calc(100dvh-3rem)]"
        ref={modalRef}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <FileSpreadsheet
              aria-hidden="true"
              className="text-primary"
              size={22}
              strokeWidth={1.75}
            />
            <h2 className="text-headline-md text-primary" id={titleId}>
              Import Sessions from CSV
            </h2>
          </div>
          <button
            aria-label="Close"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            disabled={isSubmitting}
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            <p className="text-body-md text-muted-foreground">
              Upload a CSV file to create multiple sessions for this program.
              Valid rows will be imported, and rows with errors will be shown
              here after processing.
            </p>

            <section className="rounded-xl bg-muted p-4 sm:p-5">
              <h3 className="text-label-md font-semibold uppercase tracking-wide text-primary">
                Expected CSV format
              </h3>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-4">
                <div>
                  <p className="text-label-sm text-muted-foreground">
                    Required
                  </p>
                  <code className="mt-1 inline-block rounded-sm border border-border bg-card px-2 py-1 text-label-sm font-semibold text-primary">
                    title, duration
                  </code>
                </div>
                <div>
                  <p className="text-label-sm text-muted-foreground">
                    Optional
                  </p>
                  <code className="mt-1 inline-block rounded-sm border border-border bg-card px-2 py-1 text-label-sm font-semibold text-primary">
                    position, instructorName, tags, mediaType, mediaUrl
                  </code>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-label-sm text-muted-foreground">
                  Sample data
                </p>
                <pre className="mt-2 overflow-x-auto rounded-md bg-inverse-surface p-3 text-label-sm leading-relaxed text-inverse-on-surface sm:p-4">
                  <code>{`title,duration,position,instructorName,tags,mediaType,mediaUrl
Welcome Session,0.5,1,Anu,"sleep,beginner",VIDEO,https://example.com/welcome.mp4
Breathing Practice,0.2,2,Anu,"breathing,sleep",AUDIO,https://example.com/breathing.mp3`}</code>
                </pre>
                <p className="mt-2 text-label-sm text-muted-foreground">
                  Duration is entered in decimal hours, such as 0.5 for 30
                  minutes.
                </p>
              </div>
            </section>

            <section>
              {selectedFile ? (
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="rounded-md bg-secondary-container p-2.5 text-primary">
                        <FileSpreadsheet
                          aria-hidden="true"
                          size={24}
                          strokeWidth={1.5}
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-label-md font-semibold text-foreground">
                          {selectedFile.name}
                        </p>
                        <p className="mt-0.5 text-label-sm text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="rounded-md border border-border bg-card px-3 py-2 text-label-sm font-semibold text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        disabled={isSubmitting}
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                      >
                        Change
                      </button>
                      <button
                        className="rounded-md px-3 py-2 text-label-sm font-semibold text-error hover:bg-error-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
                        disabled={isSubmitting}
                        onClick={removeFile}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  className="flex min-h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-card px-5 py-5 text-center text-muted-foreground hover:border-primary hover:bg-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-44"
                  disabled={isSubmitting}
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <FileUp aria-hidden="true" size={32} strokeWidth={1.5} />
                  <span className="mt-2.5 text-body-md font-semibold text-foreground">
                    Choose a CSV file
                  </span>
                  <span className="mt-1 text-label-sm">
                    CSV files only, up to 10 MB
                  </span>
                </button>
              )}

              <input
                accept=".csv,text/csv"
                aria-describedby={fileError ? fileErrorId : undefined}
                className="sr-only"
                disabled={isSubmitting}
                onChange={handleFileChange}
                ref={fileInputRef}
                type="file"
              />

              {fileError ? (
                <p className="mt-2 text-label-sm text-error" id={fileErrorId}>
                  {fileError}
                </p>
              ) : null}

              {requestError ? (
                <p
                  className="mt-3 rounded-md bg-error-container px-3 py-2 text-label-sm text-on-error-container"
                  role="alert"
                >
                  {requestError}
                </p>
              ) : null}

              {result ? (
                <section
                  aria-labelledby={statusId}
                  className="mt-4 rounded-xl border border-border bg-muted p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3
                        className="text-label-md font-semibold text-primary"
                        id={statusId}
                      >
                        Import complete
                      </h3>
                      <p className="mt-1 text-label-sm text-muted-foreground">
                        {result.importedCount} imported · {result.failedCount}{" "}
                        failed
                      </p>
                    </div>
                    {result.idempotentReplay ? (
                      <span className="rounded-full bg-secondary-container px-3 py-1.5 text-label-sm text-on-secondary-container">
                        Previous result
                      </span>
                    ) : null}
                  </div>

                  {result.errors.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-label-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Rows needing attention
                      </p>
                      <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto">
                        {result.errors.map((error, index) => (
                          <li
                            className="rounded-md bg-error-container px-3 py-2 text-label-sm text-on-error-container"
                            key={`${error.row}-${error.field ?? "row"}-${index}`}
                          >
                            Row {error.row}
                            {error.field ? ` · ${error.field}` : ""}:{" "}
                            {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-3 text-label-sm text-muted-foreground">
                      All rows were imported successfully.
                    </p>
                  )}
                </section>
              ) : null}
            </section>
          </div>

          <footer className="flex items-center justify-end gap-3 border-t border-border bg-muted px-5 py-3.5 sm:px-6">
            <button
              className="rounded-md px-4 py-2.5 text-label-md font-medium text-foreground transition-colors hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              disabled={isSubmitting}
              onClick={onClose}
              type="button"
            >
              Close
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!selectedFile || isSubmitting}
              type="submit"
            >
              <FileUp aria-hidden="true" size={18} strokeWidth={1.75} />
              {isSubmitting ? "Importing..." : "Import Sessions"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
