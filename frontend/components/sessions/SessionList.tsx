"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Leaf } from "lucide-react";

import { SortableSessionItem } from "@/components/sessions/SortableSessionItem";
import type { SessionSummary } from "@/types/session";

type SessionListProps = {
  deletingSessionId?: string;
  isReordering?: boolean;
  onDelete: (session: SessionSummary) => void;
  onEdit: (session: SessionSummary) => void;
  onReorder: (sessionIds: string[]) => void;
  sessions: SessionSummary[];
};

export function SessionList({
  deletingSessionId = "",
  isReordering = false,
  onDelete,
  onEdit,
  onReorder,
  sessions,
}: SessionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;

    if (!over || active.id === over.id || isReordering) {
      return;
    }

    const oldIndex = sessions.findIndex((session) => session.id === active.id);
    const newIndex = sessions.findIndex((session) => session.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const reorderedIds = sessions.map((session) => session.id);
    const [movedId] = reorderedIds.splice(oldIndex, 1);
    reorderedIds.splice(newIndex, 0, movedId);
    onReorder(reorderedIds);
  }

  if (sessions.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card px-6 py-12 text-center shadow-card">
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
          Add your first session to start building this program.
        </p>
      </section>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <SortableContext
        items={sessions.map((session) => session.id)}
        strategy={verticalListSortingStrategy}
      >
        <section aria-label="Program sessions" className="space-y-5">
          {sessions.map((session) => (
            <SortableSessionItem
              isDeleting={deletingSessionId === session.id}
              isInteractionDisabled={
                isReordering || Boolean(deletingSessionId)
              }
              key={session.id}
              onDelete={onDelete}
              onEdit={onEdit}
              session={session}
            />
          ))}
        </section>
      </SortableContext>
    </DndContext>
  );
}
