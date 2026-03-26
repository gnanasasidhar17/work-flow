"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, ArrowUp, ArrowDown, ArrowRight, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";

interface DataTableViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onPriorityChange: (taskId: string, priority: string) => void;
}

type SortKey = "title" | "status" | "priority" | "dueDate" | "$createdAt";
type SortDir = "asc" | "desc";

const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
const statusOrder = { todo: 0, "in-progress": 1, "in-review": 2, done: 3 };

const priorityIcons: Record<string, React.ReactNode> = {
  low: <ArrowDown className="h-3.5 w-3.5 text-gray-500" />,
  medium: <ArrowRight className="h-3.5 w-3.5 text-amber-500" />,
  high: <ArrowUp className="h-3.5 w-3.5 text-red-500" />,
  urgent: <AlertTriangle className="h-3.5 w-3.5 text-red-600" />,
};

export function DataTableView({ tasks, onEditTask, onStatusChange, onPriorityChange }: DataTableViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("$createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "status":
          comparison = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
          break;
        case "priority":
          comparison = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
          break;
        case "dueDate":
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = dateA - dateB;
          break;
        case "$createdAt":
          comparison = new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime();
          break;
      }
      return sortDir === "asc" ? comparison : -comparison;
    });
  }, [tasks, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortButton = ({ column, label }: { column: SortKey; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(column)}
      className="h-8 -ml-3 text-xs font-semibold"
    >
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No tasks found. Create one to get started.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-[40%]"><SortButton column="title" label="Title" /></TableHead>
            <TableHead><SortButton column="status" label="Status" /></TableHead>
            <TableHead><SortButton column="priority" label="Priority" /></TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead><SortButton column="dueDate" label="Due Date" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.map((task) => {
            const statusConfig = TASK_STATUSES.find((s) => s.value === task.status);
            const priorityConfig = TASK_PRIORITIES.find((p) => p.value === task.priority);
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

            return (
              <TableRow
                key={task.$id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onEditTask(task)}
              >
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <Select
                    value={task.status}
                    onValueChange={(v) => {
                      if (v) onStatusChange(task.$id, v as TaskStatus);
                    }}
                  >
                    <SelectTrigger
                      className="h-7 w-28 text-xs border-0 bg-transparent px-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Badge className={cn("text-xs", statusConfig?.bgColor)}>
                        {statusConfig?.label}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                            {s.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={task.priority}
                    onValueChange={(v) => {
                      if (v) onPriorityChange(task.$id, v);
                    }}
                  >
                    <SelectTrigger
                      className="h-7 w-32 text-xs border-0 bg-transparent px-0 hover:bg-muted/50 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5 px-2">
                        {priorityIcons[task.priority]}
                        <span className="text-sm">{priorityConfig?.label}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_PRIORITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <div className="flex items-center gap-2">
                            {priorityIcons[p.value]}
                            {p.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {task.assigneeName ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {task.assigneeName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assigneeName}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {task.dueDate ? (
                    <span className={cn("text-sm", isOverdue && "text-red-500 font-medium")}>
                      {format(new Date(task.dueDate), "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
