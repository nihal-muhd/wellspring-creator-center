"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AudioLines, Film, GripVertical, Pen, Trash2 } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";

import type { SessionSummary } from "@/types/session";

type SortableSessionItemProps = {
  isDeleting: boolean;
  isInteractionDisabled: boolean;
  onDelete: (session: SessionSummary) => void;
  onEdit: (session: SessionSummary) => void;
  session: SessionSummary;
};

function formatDuration(duration: number): string {
  return `${duration} min`;
}

export function SortableSessionItem({
  isDeleting,
  isInteractionDisabled,
  onDelete,
  onEdit,
  session,
}: SortableSessionItemProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: session.id,
    disabled: isInteractionDisabled,
  });
  const MediaIcon = session.mediaType === "AUDIO" ? AudioLines : Film;
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      className={`rounded-xl border bg-card px-4 py-4 shadow-card sm:px-5 sm:py-5 ${
        isDragging
          ? "z-10 border-primary opacity-80"
          : "border-border"
      }`}
      ref={setNodeRef}
      style={style}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5 lg:gap-6">
        <button
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${session.title}`}
          className="self-center rounded-md p-2 text-outline touch-none hover:bg-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
          disabled={isInteractionDisabled}
          ref={setActivatorNodeRef}
          title={`Drag to reorder ${session.title}`}
          type="button"
        >
          <GripVertical aria-hidden="true" size={20} strokeWidth={1.75} />
        </button>

        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-surface-container sm:w-36">
          {session.thumbnailUrl ? (
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="144px"
              src={session.thumbnailUrl}
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-primary">
              <MediaIcon aria-hidden="true" size={26} strokeWidth={1.5} />
            </div>
          )}
          <span className="absolute bottom-1.5 right-1.5 rounded-sm bg-inverse-surface/80 px-1.5 py-0.5 text-label-sm text-inverse-on-surface">
            {formatDuration(session.duration)}
          </span>
        </div>

        <div className="min-w-0 flex-1 py-0.5">
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
          <h2 className="mt-1.5 text-lg font-semibold leading-snug text-foreground">
            {session.title}
          </h2>
          <p className="mt-0.5 text-label-md text-muted-foreground">
            {session.instructorName
              ? `Instructor: ${session.instructorName}`
              : "Instructor not assigned"}
          </p>
        </div>

        {session.tags.length > 0 ? (
          <ul
            aria-label={`Tags for ${session.title}`}
            className="flex flex-wrap gap-2 sm:max-w-56 sm:justify-end lg:max-w-64"
          >
            {session.tags.map((tag) => (
              <li
                className="rounded-full bg-secondary-container px-3 py-1.5 text-label-sm text-on-secondary-container"
                key={tag}
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex self-start sm:self-center">
          <button
            aria-label={`Edit ${session.title}`}
            className="rounded-md p-2.5 text-primary transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isInteractionDisabled}
            onClick={() => onEdit(session)}
            title={`Edit ${session.title}`}
            type="button"
          >
            <Pen aria-hidden="true" size={18} strokeWidth={1.75} />
          </button>
          <button
            aria-label={`Delete ${session.title}`}
            className="rounded-md p-2.5 text-error transition-colors hover:bg-error-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isInteractionDisabled}
            onClick={() => onDelete(session)}
            title={`Delete ${session.title}`}
            type="button"
          >
            <Trash2 aria-hidden="true" size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>
      {isDeleting ? (
        <span className="sr-only" role="status">
          Deleting {session.title}
        </span>
      ) : null}
    </article>
  );
}
