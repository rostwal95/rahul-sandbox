"use client";
import * as React from "react";
import {
  DndContext,
  closestCenter,
  useSensors,
  PointerSensor,
  useSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export function BlocksPalette({
  items,
  onReorder,
  onInsert,
  title = "Blocks",
}: {
  items: { id: string; type: string; label: string }[];
  onReorder: (i: any) => void;
  onInsert?: (t: string) => void;
  title?: string;
}) {
  const sensors = useSensors(useSensor(PointerSensor));
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIdx = items.findIndex((i) => i.id === active.id);
      const newIdx = items.findIndex((i) => i.id === over.id);
      onReorder(arrayMove(items, oldIdx, newIdx));
    }
  };
  return (
    <section>
      <h4 className="mb-2 text-sm font-medium text-neutral-600">{title}</h4>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {items.map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-neutral-50"
              >
                <span>{i.label}</span>
                {onInsert && (
                  <button
                    onClick={() => onInsert(i.type)}
                    className="text-teal-600 text-xs hover:underline"
                  >
                    Add
                  </button>
                )}
              </li>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </section>
  );
}
