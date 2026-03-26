"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, GripVertical, ArrowUp, ArrowRight, ArrowDown, AlertTriangle } from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";
import type { Task, WorkspaceMember } from "@/types";
import { TASK_PRIORITIES } from "@/lib/constants";

interface KanbanCardProps {
  task: Task;
  onClick: () => void;
  members: WorkspaceMember[];
}

const priorityIcons: Record<string, React.ReactNode> = {
  low: <ArrowDown className="h-3 w-3 text-gray-500" />,
  medium: <ArrowRight className="h-3 w-3 text-amber-500" />,
  high: <ArrowUp className="h-3 w-3 text-red-500" />,
  urgent: <AlertTriangle className="h-3 w-3 text-red-600" />,
};

export function KanbanCard({ task, onClick, members }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.$id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignee = members.find((m) => m.userId === task.assigneeId);
  const isOverdue =
    task.dueDate && isBefore(new Date(task.dueDate), new Date()) && task.status !== "done";
  const priorityConfig = TASK_PRIORITIES.find((p) => p.value === task.priority);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card rounded-lg border border-border p-3 cursor-pointer",
        "hover:shadow-md hover:border-primary/20 transition-all duration-200",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        "group",
        isDragging && "opacity-50 shadow-lg rotate-2 scale-105 z-50 cursor-grabbing"
      )}
      onClick={onClick}
    >
      {/* Drag Handle + Labels */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1 flex-wrap">
          {task.labels?.map((label, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-5 font-medium"
              style={{
                backgroundColor: `hsl(${(i * 137.5) % 360}, 50%, 90%)`,
                color: `hsl(${(i * 137.5) % 360}, 60%, 30%)`,
              }}
            >
              {label}
            </Badge>
          ))}
        </div>
        <div
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 -mr-1 -mt-1"
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Title */}
      <p className="text-sm font-medium leading-snug mb-2">{task.title}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Priority */}
          <div className="flex items-center gap-1" title={priorityConfig?.label}>
            {priorityIcons[task.priority]}
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "text-red-500" : "text-muted-foreground"
              )}
            >
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), "MMM d")}
            </div>
          )}
        </div>

        {/* Assignee */}
        {assignee && (
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {assignee.userName?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
