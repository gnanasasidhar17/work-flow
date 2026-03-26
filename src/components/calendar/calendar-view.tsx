"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TASK_STATUSES } from "@/lib/constants";
import type { Task } from "@/types";

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onCreateTask: (date: Date) => void;
}

export function CalendarView({ tasks, onEditTask, onCreateTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const calendarStart = view === "month" 
    ? startOfWeek(monthStart) 
    : startOfWeek(currentDate);
    
  const calendarEnd = view === "month" 
    ? endOfWeek(monthEnd) 
    : endOfWeek(currentDate);

  const days = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart, calendarEnd]
  );

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (task.dueDate) {
        const key = format(new Date(task.dueDate), "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    });
    return map;
  }, [tasks]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="h-full flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {view === "month" 
            ? format(currentDate, "MMMM yyyy")
            : `Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`
          }
        </h2>
        <div className="flex items-center gap-4">
          <Tabs value={view} onValueChange={(v) => setView(v as "month" | "week")}>
            <TabsList className="h-8">
              <TabsTrigger value="month" className="text-xs px-3">Month</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-3">Week</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-px mb-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px flex-1 bg-border rounded-xl overflow-hidden">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const today = isToday(day);

          return (
            <div
              key={dateKey}
              className={cn(
                "bg-card p-1.5 relative group overflow-hidden flex flex-col",
                view === "month" ? "min-h-[100px]" : "min-h-[300px]",
                !isCurrentMonth && view === "month" && "bg-muted/30",
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    today && "bg-primary text-primary-foreground",
                    !isCurrentMonth && "text-muted-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
                <button
                  onClick={() => onCreateTask(day)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 rounded flex items-center justify-center hover:bg-accent"
                >
                  <Plus className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>

              <div className={cn("space-y-1 overflow-y-auto flex-1 pr-1", view === "month" ? "max-h-[80px]" : "")}>
                {dayTasks.slice(0, view === "month" ? 3 : 15).map((task) => {
                  const statusConfig = TASK_STATUSES.find((s) => s.value === task.status);
                  return (
                    <button
                      key={task.$id}
                      onClick={() => onEditTask(task)}
                      className="w-full text-left px-1.5 py-0.5 rounded text-[11px] truncate hover:bg-accent transition-colors"
                      style={{
                        borderLeft: `2px solid ${statusConfig?.color || "#6B7280"}`,
                      }}
                    >
                      {task.title}
                    </button>
                  );
                })}
                {dayTasks.length > (view === "month" ? 3 : 15) && (
                  <p className="text-[10px] text-muted-foreground px-1.5 mt-1">
                    +{dayTasks.length - (view === "month" ? 3 : 15)} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
