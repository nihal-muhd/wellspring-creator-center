"use client";

import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ProgramCard } from "@/components/programs/ProgramCard";
import { ProgramFormModal } from "@/components/programs/ProgramFormModal";
import { demoPrograms } from "@/lib/programs/demoPrograms";
import type { ProgramFormValues, ProgramSummary } from "@/types/program";

export function ProgramsPageContent() {
  const [programs, setPrograms] = useState<ProgramSummary[]>(demoPrograms);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedProgram, setSelectedProgram] =
    useState<ProgramSummary | null>(null);

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
    setSelectedProgram(null);
    setModalMode("add");
  }

  function openEditModal(program: ProgramSummary): void {
    setSelectedProgram(program);
    setModalMode("edit");
  }

  function closeModal(): void {
    setModalMode(null);
    setSelectedProgram(null);
  }

  function saveProgram(values: ProgramFormValues): void {
    if (modalMode === "edit" && selectedProgram) {
      setPrograms((currentPrograms) =>
        currentPrograms.map((program) =>
          program.id === selectedProgram.id
            ? {
                ...program,
                ...values,
              }
            : program,
        ),
      );
    } else {
      setPrograms((currentPrograms) => [
        {
          id: crypto.randomUUID(),
          sessionCount: 0,
          ...values,
        },
        ...currentPrograms,
      ]);
    }

    closeModal();
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

        {filteredPrograms.length > 0 ? (
          <>
            <section
              aria-label="Programs"
              className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredPrograms.map((program) => (
                <ProgramCard
                  key={program.id}
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
              No programs found
            </h2>
            <p className="mt-1 text-label-md text-muted-foreground">
              Try another title or keyword.
            </p>
          </section>
        )}
      </div>

      {modalMode ? (
        <ProgramFormModal
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
