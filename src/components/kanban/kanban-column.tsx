"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  onCreateTask: () => void;
  children: ReactNode;
}

export function KanbanColumn({ id, title, color, count, onCreateTask, children }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-72 min-w-[288px] flex-shrink-0 rounded-xl bg-muted/40 snap-center",
        isOver && "bg-accent/50 ring-2 ring-primary/20"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {count}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={onCreateTask}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Column Content */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 kanban-column">
        {children}
      </div>
    </div>
  );
}
