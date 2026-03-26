"use client";

import { useMemo, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { TASK_STATUSES } from "@/lib/constants";
import type { Task, TaskStatus, WorkspaceMember } from "@/types";

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onCreateTask: (status: TaskStatus) => void;
  members: WorkspaceMember[];
}

export function KanbanBoard({ tasks, onStatusChange, onEditTask, onCreateTask, members }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const columns = useMemo(() => {
    return TASK_STATUSES.map((status) => ({
      ...status,
      tasks: tasks
        .filter((t) => t.status === status.value)
        .sort((a, b) => a.position - b.position),
    }));
  }, [tasks]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find((t) => t.$id === event.active.id);
    if (task) setActiveTask(task);
  }, [tasks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = TASK_STATUSES.find((s) => s.value === overId);
    if (targetColumn) {
      const task = tasks.find((t) => t.$id === activeId);
      if (task && task.status !== targetColumn.value) {
        onStatusChange(activeId, targetColumn.value);
      }
      return;
    }

    // Dropped on another task - find the column of the target task
    const targetTask = tasks.find((t) => t.$id === overId);
    if (targetTask) {
      const task = tasks.find((t) => t.$id === activeId);
      if (task && task.status !== targetTask.status) {
        onStatusChange(activeId, targetTask.status);
      }
    }
  }, [tasks, onStatusChange]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none">
        {columns.map((column) => (
          <KanbanColumn
            key={column.value}
            id={column.value}
            title={column.label}
            color={column.color}
            count={column.tasks.length}
            onCreateTask={() => onCreateTask(column.value)}
          >
            <SortableContext
              items={column.tasks.map((t) => t.$id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2.5 min-h-[100px]">
                {column.tasks.map((task) => (
                  <KanbanCard
                    key={task.$id}
                    task={task}
                    onClick={() => onEditTask(task)}
                    members={members}
                  />
                ))}
              </div>
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="kanban-card-overlay">
            <KanbanCard task={activeTask} onClick={() => {}} members={members} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
