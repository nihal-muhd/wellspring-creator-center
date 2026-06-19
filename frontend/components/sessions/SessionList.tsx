import { AudioLines, Film, Leaf, Pen } from "lucide-react";
import Image from "next/image";

import type { SessionSummary } from "@/types/session";

type SessionListProps = {
  onEdit: (session: SessionSummary) => void;
  sessions: SessionSummary[];
};

function formatDuration(duration: number): string {
  return `${duration} min`;
}

export function SessionList({ onEdit, sessions }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
        <Leaf
          aria-hidden="true"
          className="mx-auto text-outline"
          size={30}
          strokeWidth={1.5}
        />
        <h2 className="mt-3 text-lg font-semibold text-foreground">
          No sessions here yet
        </h2>
        <p className="mt-1 text-label-md text-muted-foreground">
          Session creation will be connected in the next step.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Program sessions" className="space-y-4">
      {sessions.map((session) => {
        const MediaIcon = session.mediaType === "AUDIO" ? AudioLines : Film;

        return (
          <article
            className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-5"
            key={session.id}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-surface-container sm:w-32">
                {session.thumbnailUrl ? (
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="128px"
                    src={session.thumbnailUrl}
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-primary">
                    <MediaIcon
                      aria-hidden="true"
                      size={26}
                      strokeWidth={1.5}
                    />
                  </div>
                )}
                <span className="absolute bottom-1.5 right-1.5 rounded-sm bg-inverse-surface/80 px-1.5 py-0.5 text-label-sm text-inverse-on-surface">
                  {formatDuration(session.duration)}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-label-sm uppercase tracking-wide text-primary">
                  Session {String(session.position).padStart(2, "0")}
                  {session.mediaType ? (
                    <MediaIcon
                      aria-label={session.mediaType.toLowerCase()}
                      size={15}
                      strokeWidth={1.75}
                    />
                  ) : null}
                </p>
                <h2 className="mt-1 text-lg font-semibold leading-snug text-foreground">
                  {session.title}
                </h2>
                <p className="mt-1 text-label-md text-muted-foreground">
                  {session.instructorName
                    ? `Instructor: ${session.instructorName}`
                    : "Instructor not assigned"}
                </p>
              </div>

              {session.tags.length > 0 ? (
                <ul
                  aria-label={`Tags for ${session.title}`}
                  className="flex flex-wrap gap-2 sm:max-w-64 sm:justify-end"
                >
                  {session.tags.map((tag) => (
                    <li
                      className="rounded-full bg-secondary-container px-3 py-1 text-label-sm text-on-secondary-container"
                      key={tag}
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}

              <button
                aria-label={`Edit ${session.title}`}
                className="self-start rounded-md p-2 text-primary transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:self-center"
                onClick={() => onEdit(session)}
                title={`Edit ${session.title}`}
                type="button"
              >
                <Pen aria-hidden="true" size={18} strokeWidth={1.75} />
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}
