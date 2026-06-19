"use client";

import { ArrowLeft, Pen, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ProgramFormModal } from "@/components/programs/ProgramFormModal";
import { SessionFormModal } from "@/components/sessions/SessionFormModal";
import { SessionList } from "@/components/sessions/SessionList";
import {
  getProgram,
  getProgramMutationErrorMessage,
  isUnauthorizedProgramError,
  updateProgram,
} from "@/lib/programs/programs";
import {
  createSession,
  deleteSession,
  getProgramSessions,
  getSessionDeleteErrorMessage,
  getSessionMutationErrorMessage,
  getSessionReorderErrorMessage,
  getSessionsErrorMessage,
  reorderSessions,
  updateSession,
} from "@/lib/sessions/sessions";
import type { ProgramFormValues, ProgramSummary } from "@/types/program";
import type { SessionFormValues, SessionSummary } from "@/types/session";

type ProgramDetailPageContentProps = {
  programId: string;
};

function formatTotalDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min content`;
  }

  if (minutes === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} content`;
  }

  return `${hours}h ${minutes}m content`;
}

export function ProgramDetailPageContent({
  programId,
}: ProgramDetailPageContentProps) {
  const router = useRouter();
  const [program, setProgram] = useState<ProgramSummary | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [sessionModalMode, setSessionModalMode] = useState<
    "add" | "edit" | null
  >(null);
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSessionSubmitting, setIsSessionSubmitting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState("");
  const [loadError, setLoadError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [sessionMutationError, setSessionMutationError] = useState("");
  const [sessionDeleteError, setSessionDeleteError] = useState("");
  const [sessionReorderError, setSessionReorderError] = useState("");

  const handleUnauthorized = useCallback(
    (error: unknown): boolean => {
      if (!isUnauthorizedProgramError(error)) {
        return false;
      }

      router.replace("/login");
      router.refresh();
      return true;
    },
    [router],
  );

  const loadProgramDetail = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setLoadError("");

    try {
      const [loadedProgram, loadedSessions] = await Promise.all([
        getProgram(programId),
        getProgramSessions(programId),
      ]);

      setProgram(loadedProgram);
      setSessions(loadedSessions);
    } catch (error) {
      if (!handleUnauthorized(error)) {
        setLoadError(getSessionsErrorMessage(error));
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized, programId]);

  useEffect(() => {
    let isActive = true;

    Promise.all([getProgram(programId), getProgramSessions(programId)])
      .then(([loadedProgram, loadedSessions]) => {
        if (isActive) {
          setProgram(loadedProgram);
          setSessions(loadedSessions);
        }
      })
      .catch((error: unknown) => {
        if (isActive && !handleUnauthorized(error)) {
          setLoadError(getSessionsErrorMessage(error));
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
  }, [handleUnauthorized, programId]);

  const totalDuration = useMemo(
    () => sessions.reduce((total, session) => total + session.duration, 0),
    [sessions],
  );

  async function saveProgram(values: ProgramFormValues): Promise<void> {
    if (!program) {
      return;
    }

    setIsSubmitting(true);
    setMutationError("");

    const selectedLocalImage = values.coverImageUrl?.startsWith("data:");
    const persistedCoverImageUrl = selectedLocalImage
      ? program.coverImageUrl
      : values.coverImageUrl;

    try {
      const updatedProgram = await updateProgram(program.id, {
        title: values.title,
        description: values.description,
        coverImageUrl: persistedCoverImageUrl ?? null,
        coverImageKey: persistedCoverImageUrl
          ? (program.coverImageKey ?? null)
          : null,
      });

      setProgram(updatedProgram);
      setIsEditOpen(false);
    } catch (error) {
      if (!handleUnauthorized(error)) {
        setMutationError(getProgramMutationErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function openSessionModal(
    mode: "add" | "edit",
    session?: SessionSummary,
  ): void {
    setSessionMutationError("");
    setSelectedSession(session ?? null);
    setSessionModalMode(mode);
  }

  function closeSessionModal(): void {
    if (isSessionSubmitting) {
      return;
    }

    setSessionModalMode(null);
    setSelectedSession(null);
    setSessionMutationError("");
  }

  async function saveSession(values: SessionFormValues): Promise<void> {
    setIsSessionSubmitting(true);
    setSessionMutationError("");

    const input = {
      title: values.title,
      duration: values.duration,
      instructorName: values.instructorName || null,
      tags: values.tags,
      mediaType: values.mediaType ?? null,
      ...(values.removePersistedMedia
        ? {
            mediaUrl: null,
            mediaKey: null,
          }
        : {}),
    };

    try {
      if (sessionModalMode === "edit" && selectedSession) {
        const updatedSession = await updateSession(selectedSession.id, input);
        setSessions((currentSessions) =>
          currentSessions.map((session) =>
            session.id === updatedSession.id ? updatedSession : session,
          ),
        );
      } else {
        const createdSession = await createSession(programId, input);
        setSessions((currentSessions) => [...currentSessions, createdSession]);
        setProgram((currentProgram) =>
          currentProgram
            ? {
                ...currentProgram,
                sessionCount: currentProgram.sessionCount + 1,
              }
            : currentProgram,
        );
      }

      setSessionModalMode(null);
      setSelectedSession(null);
    } catch (error) {
      if (!handleUnauthorized(error)) {
        setSessionMutationError(getSessionMutationErrorMessage(error));
      }
    } finally {
      setIsSessionSubmitting(false);
    }
  }

  async function handleDeleteSession(session: SessionSummary): Promise<void> {
    const confirmed = window.confirm(
      `Delete "${session.title}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingSessionId(session.id);
    setSessionDeleteError("");

    try {
      await deleteSession(session.id);
      setSessions((currentSessions) =>
        currentSessions.filter((item) => item.id !== session.id),
      );
      setProgram((currentProgram) =>
        currentProgram
          ? {
              ...currentProgram,
              sessionCount: Math.max(0, currentProgram.sessionCount - 1),
            }
          : currentProgram,
      );
    } catch (error) {
      if (!handleUnauthorized(error)) {
        setSessionDeleteError(getSessionDeleteErrorMessage(error));
      }
    } finally {
      setDeletingSessionId("");
    }
  }

  async function handleReorderSessions(sessionIds: string[]): Promise<void> {
    const previousSessions = sessions;
    const sessionById = new Map(
      previousSessions.map((session) => [session.id, session]),
    );
    const optimisticSessions = sessionIds.flatMap((sessionId, index) => {
      const session = sessionById.get(sessionId);

      return session
        ? [
            {
              ...session,
              position: index + 1,
            },
          ]
        : [];
    });

    if (optimisticSessions.length !== previousSessions.length) {
      return;
    }

    setSessions(optimisticSessions);
    setIsReordering(true);
    setSessionReorderError("");

    try {
      const persistedSessions = await reorderSessions(programId, sessionIds);
      setSessions(persistedSessions);
    } catch (error) {
      setSessions(previousSessions);

      if (!handleUnauthorized(error)) {
        setSessionReorderError(getSessionReorderErrorMessage(error));
      }
    } finally {
      setIsReordering(false);
    }
  }

  if (isLoading) {
    return (
      <main
        aria-label="Loading program details"
        className="min-h-dvh bg-background"
      >
        <div className="border-b border-border bg-card/80 px-4 py-5 sm:px-6 lg:px-8">
          <div className="h-5 w-40 animate-pulse rounded-md bg-surface-container motion-reduce:animate-none" />
        </div>
        <div className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="h-10 w-2/3 animate-pulse rounded-md bg-surface-container motion-reduce:animate-none" />
          <div className="h-24 animate-pulse rounded-xl bg-surface-container motion-reduce:animate-none" />
          <div className="h-32 animate-pulse rounded-xl bg-surface-container motion-reduce:animate-none" />
        </div>
      </main>
    );
  }

  if (loadError || !program) {
    return (
      <main className="min-h-dvh bg-background">
        <div className="border-b border-border bg-card/80 px-4 py-5 sm:px-6 lg:px-8">
          <Link
            className="inline-flex items-center gap-2 text-label-md text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            href="/programs"
          >
            <ArrowLeft aria-hidden="true" size={18} />
            Back to Programs
          </Link>
        </div>
        <section className="mx-auto mt-8 max-w-xl rounded-xl border border-border bg-card p-6 text-center shadow-card">
          <p className="text-label-md text-error" role="alert">
            {loadError || "Program not found."}
          </p>
          <button
            className="mt-4 rounded-md bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            onClick={() => void loadProgramDetail()}
            type="button"
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            className="inline-flex items-center gap-2 text-label-md text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            href="/programs"
          >
            <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.75} />
            Back to Programs
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-headline-lg text-primary">{program.title}</h1>
            <p className="mt-3 max-w-xl text-body-md text-muted-foreground">
              {program.description || "No program description has been added."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-label-md font-semibold text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => {
                setMutationError("");
                setIsEditOpen(true);
              }}
              type="button"
            >
              <Pen aria-hidden="true" size={18} strokeWidth={1.75} />
              Edit Program
            </button>
            <button
              className="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-label-md font-semibold text-muted-foreground opacity-60"
              disabled
              title="Bulk import will be added in the CSV import phase."
              type="button"
            >
              <Upload aria-hidden="true" size={18} strokeWidth={1.75} />
              Bulk Import
            </button>
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-label-md font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isReordering || Boolean(deletingSessionId)}
              onClick={() => openSessionModal("add")}
              type="button"
            >
              <Plus aria-hidden="true" size={18} strokeWidth={1.75} />
              Add Session
            </button>
          </div>
        </header>

        <section className="my-8 flex min-h-20 flex-col justify-center gap-4 rounded-xl border border-border bg-muted px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <p className="flex flex-wrap items-center gap-3 text-label-md text-muted-foreground">
            <span className="text-foreground">
              {sessions.length} {sessions.length === 1 ? "session" : "sessions"}{" "}
              total
            </span>
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-primary"
            />
            <span>{formatTotalDuration(totalDuration)}</span>
          </p>

          <p
            aria-live="polite"
            className="text-label-sm text-muted-foreground"
          >
            {isReordering
              ? "Saving session order..."
              : "Drag the handles to reorder sessions."}
          </p>
        </section>

        {sessionReorderError ? (
          <p
            className="mb-5 rounded-md bg-error-container px-3 py-2 text-label-sm text-on-error-container"
            role="alert"
          >
            {sessionReorderError}
          </p>
        ) : null}

        {sessionDeleteError ? (
          <p
            className="mb-5 rounded-md bg-error-container px-3 py-2 text-label-sm text-on-error-container"
            role="alert"
          >
            {sessionDeleteError}
          </p>
        ) : null}

        <SessionList
          deletingSessionId={deletingSessionId}
          isReordering={isReordering}
          onDelete={(session) => void handleDeleteSession(session)}
          onEdit={(session) => openSessionModal("edit", session)}
          onReorder={(sessionIds) => void handleReorderSessions(sessionIds)}
          sessions={sessions}
        />
      </div>

      {isEditOpen ? (
        <ProgramFormModal
          error={mutationError}
          isSubmitting={isSubmitting}
          key={`edit-${program.id}`}
          mode="edit"
          onClose={() => {
            if (!isSubmitting) {
              setIsEditOpen(false);
              setMutationError("");
            }
          }}
          onSave={saveProgram}
          program={program}
        />
      ) : null}

      {sessionModalMode ? (
        <SessionFormModal
          error={sessionMutationError}
          isSubmitting={isSessionSubmitting}
          key={`${sessionModalMode}-${selectedSession?.id ?? "new"}`}
          mode={sessionModalMode}
          onClose={closeSessionModal}
          onSave={saveSession}
          session={selectedSession ?? undefined}
        />
      ) : null}
    </main>
  );
}
