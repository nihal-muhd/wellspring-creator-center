"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ProgramCard } from "@/components/programs/ProgramCard";
import { ProgramFormModal } from "@/components/programs/ProgramFormModal";
import {
  createProgram,
  deleteProgram,
  getProgramDeleteErrorMessage,
  getProgramMutationErrorMessage,
  getPrograms,
  getProgramsErrorMessage,
  isUnauthorizedProgramError,
  updateProgram,
} from "@/lib/programs/programs";
import type { ProgramFormValues, ProgramSummary } from "@/types/program";

export function ProgramsPageContent() {
  const router = useRouter();
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedProgram, setSelectedProgram] =
    useState<ProgramSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProgramId, setDeletingProgramId] = useState("");
  const [loadError, setLoadError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [deleteError, setDeleteError] = useState("");

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

  const loadPrograms = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setLoadError("");

    try {
      setPrograms(await getPrograms());
    } catch (error) {
      if (!handleUnauthorized(error)) {
        setLoadError(getProgramsErrorMessage(error));
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    let isActive = true;

    getPrograms()
      .then((loadedPrograms) => {
        if (isActive) {
          setPrograms(loadedPrograms);
        }
      })
      .catch((error: unknown) => {
        if (isActive && !handleUnauthorized(error)) {
          setLoadError(getProgramsErrorMessage(error));
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
  }, [handleUnauthorized]);

  const filteredPrograms = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return programs;
    }

    return programs.filter((program) =>
      `${program.title} ${program.description}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [programs, searchQuery]);

  function openAddModal(): void {
    setMutationError("");
    setSelectedProgram(null);
    setModalMode("add");
  }

  function openEditModal(program: ProgramSummary): void {
    setMutationError("");
    setSelectedProgram(program);
    setModalMode("edit");
  }

  function closeModal(): void {
    if (isSubmitting) {
      return;
    }

    setModalMode(null);
    setSelectedProgram(null);
    setMutationError("");
  }

  async function saveProgram(values: ProgramFormValues): Promise<void> {
    setIsSubmitting(true);
    setMutationError("");

    const selectedLocalImage = values.coverImageUrl?.startsWith("data:");
    const persistedCoverImageUrl = selectedLocalImage
      ? selectedProgram?.coverImageUrl
      : values.coverImageUrl;

    try {
      if (modalMode === "edit" && selectedProgram) {
        const updatedProgram = await updateProgram(selectedProgram.id, {
          title: values.title,
          description: values.description,
          coverImageUrl: persistedCoverImageUrl ?? null,
          coverImageKey: persistedCoverImageUrl
            ? (selectedProgram.coverImageKey ?? null)
            : null,
        });

        setPrograms((currentPrograms) =>
          currentPrograms.map((program) =>
            program.id === updatedProgram.id ? updatedProgram : program,
          ),
        );
      } else {
        const createdProgram = await createProgram({
          title: values.title,
          description: values.description,
        });

        setPrograms((currentPrograms) => [
          createdProgram,
          ...currentPrograms,
        ]);
      }

      setModalMode(null);
      setSelectedProgram(null);
    } catch (error) {
      if (!handleUnauthorized(error)) {
        setMutationError(getProgramMutationErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(program: ProgramSummary): Promise<void> {
    const confirmed = window.confirm(
      `Delete "${program.title}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingProgramId(program.id);
    setDeleteError("");

    try {
      await deleteProgram(program.id);
      setPrograms((currentPrograms) =>
        currentPrograms.filter((item) => item.id !== program.id),
      );
    } catch (error) {
      if (!handleUnauthorized(error)) {
        setDeleteError(getProgramDeleteErrorMessage(error));
      }
    } finally {
      setDeletingProgramId("");
    }
  }

  return (
    <main className="min-h-dvh bg-background">
      <div className="border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8">
        <label className="relative block max-w-lg">
          <span className="sr-only">Search programs</span>
          <Search
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline"
            size={18}
            strokeWidth={1.75}
          />
          <input
            className="w-full rounded-full border border-transparent bg-muted py-2.5 pl-11 pr-4 text-label-md text-foreground outline-none placeholder:text-outline focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary-fixed"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search programs..."
            type="search"
            value={searchQuery}
          />
        </label>
      </div>

      <div className="mx-auto w-full max-w-app px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-headline-md text-primary">Program Studio</h1>
            <p className="mt-1 text-label-md text-muted-foreground">
              Design and manage your wellness curriculum.
            </p>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            onClick={openAddModal}
            type="button"
          >
            <Plus aria-hidden="true" size={18} strokeWidth={1.75} />
            New Program
          </button>
        </header>

        {loadError ? (
          <section className="mt-6 rounded-xl border border-border bg-card p-6 text-center shadow-card">
            <p className="text-label-md text-error" role="alert">
              {loadError}
            </p>
            <button
              className="mt-4 rounded-md bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              onClick={() => void loadPrograms()}
              type="button"
            >
              Try Again
            </button>
          </section>
        ) : isLoading ? (
          <section
            aria-label="Loading programs"
            className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {Array.from({ length: 3 }, (_, index) => (
              <div
                className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
                key={index}
              >
                <div className="aspect-video animate-pulse bg-surface-container motion-reduce:animate-none" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded-md bg-surface-container motion-reduce:animate-none" />
                  <div className="h-4 w-full animate-pulse rounded-md bg-surface-container motion-reduce:animate-none" />
                  <div className="h-4 w-1/3 animate-pulse rounded-md bg-surface-container motion-reduce:animate-none" />
                </div>
              </div>
            ))}
          </section>
        ) : filteredPrograms.length > 0 ? (
          <>
            {deleteError ? (
              <p
                className="mt-6 rounded-md bg-error-container px-3 py-2 text-label-sm text-on-error-container"
                role="alert"
              >
                {deleteError}
              </p>
            ) : null}
            <section
              aria-label="Programs"
              className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredPrograms.map((program) => (
                <ProgramCard
                  deletingProgramId={deletingProgramId}
                  key={program.id}
                  onDelete={(item) => void handleDelete(item)}
                  onEdit={openEditModal}
                  program={program}
                />
              ))}
            </section>

            <p
              aria-live="polite"
              className="mt-8 border-t border-border pt-5 text-label-sm text-muted-foreground"
            >
              Showing {filteredPrograms.length} of {programs.length} programs
            </p>
          </>
        ) : (
          <section className="mt-6 rounded-xl border border-border bg-card p-6 text-center shadow-card">
            <Search
              aria-hidden="true"
              className="mx-auto text-outline"
              size={28}
              strokeWidth={1.5}
            />
            <h2 className="mt-3 text-lg font-semibold text-foreground">
              {programs.length === 0
                ? "No programs yet"
                : "No programs found"}
            </h2>
            <p className="mt-1 text-label-md text-muted-foreground">
              {programs.length === 0
                ? "Create your first wellness program to get started."
                : "Try another title or keyword."}
            </p>
            {programs.length === 0 ? (
              <button
                className="mt-4 rounded-md bg-primary px-4 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                onClick={openAddModal}
                type="button"
              >
                Add Program
              </button>
            ) : null}
          </section>
        )}
      </div>

      {modalMode ? (
        <ProgramFormModal
          error={mutationError}
          isSubmitting={isSubmitting}
          key={`${modalMode}-${selectedProgram?.id ?? "new"}`}
          mode={modalMode}
          onClose={closeModal}
          onSave={saveProgram}
          program={selectedProgram ?? undefined}
        />
      ) : null}
    </main>
  );
}
