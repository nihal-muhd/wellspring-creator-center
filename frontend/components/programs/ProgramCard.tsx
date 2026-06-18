import {
  CalendarDays,
  EllipsisVertical,
  Leaf,
  Pen,
  Trash2,
} from "lucide-react";
import Image from "next/image";

import type { ProgramSummary } from "@/types/program";

type ProgramCardProps = {
  program: ProgramSummary;
  onEdit: (program: ProgramSummary) => void;
};

export function ProgramCard({ program, onEdit }: ProgramCardProps) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <div className="relative aspect-video overflow-hidden bg-surface-container">
        {program.coverImageUrl ? (
          <Image
            alt=""
            className={[
              "object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.02]",
              program.coverPosition === "top"
                ? "object-top"
                : program.coverPosition === "bottom"
                  ? "object-bottom"
                  : "object-center",
            ].join(" ")}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
            src={program.coverImageUrl}
            unoptimized={program.coverImageUrl.startsWith("data:")}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary-container text-primary">
            <Leaf aria-hidden="true" size={36} strokeWidth={1.25} />
          </div>
        )}
      </div>

      <div className="flex min-h-52 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold leading-snug text-primary">
            {program.title}
          </h2>
          <button
            aria-label={`More actions for ${program.title}`}
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            title="Program actions will be connected with CRUD"
            type="button"
          >
            <EllipsisVertical aria-hidden="true" size={18} />
          </button>
        </div>

        <p className="mt-2 line-clamp-2 text-label-md text-muted-foreground">
          {program.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="flex items-center gap-2 text-label-sm text-muted-foreground">
            <CalendarDays aria-hidden="true" size={16} strokeWidth={1.75} />
            <span>
              {program.sessionCount}{" "}
              {program.sessionCount === 1 ? "Session" : "Sessions"}
            </span>
          </p>

          <div className="flex items-center gap-1">
            <button
              aria-label={`Edit ${program.title}`}
              className="rounded-md p-1.5 text-primary transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => onEdit(program)}
              title={`Edit ${program.title}`}
              type="button"
            >
              <Pen aria-hidden="true" size={16} strokeWidth={1.75} />
            </button>
            <button
              aria-label={`Delete ${program.title}`}
              className="rounded-md p-1.5 text-error transition-colors hover:bg-error-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
              title="Delete will be connected with Program CRUD"
              type="button"
            >
              <Trash2 aria-hidden="true" size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
