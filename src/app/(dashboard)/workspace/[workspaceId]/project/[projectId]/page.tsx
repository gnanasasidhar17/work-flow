"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTasks, useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useProject } from "@/hooks/use-projects";
import { useWorkspaceMembers } from "@/hooks/use-workspaces";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { DataTableView } from "@/components/data-table/data-table-view";
import { CalendarView } from "@/components/calendar/calendar-view";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { EditProjectModal } from "@/components/projects/edit-project-modal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  LayoutGrid,
  Table2,
  Calendar,
  Search,
  Filter,
  Settings,
} from "lucide-react";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/constants";
import type { TaskStatus, TaskPriority, Task } from "@/types";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const workspaceId = params.workspaceId as string;

  const [view, setView] = useState<"board" | "table" | "calendar">("board");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasks, isLoading: tasksLoading } = useTasks({ projectId });
  const { data: members } = useWorkspaceMembers(workspaceId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  const handleCreateTask = useCallback((data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    dueDate?: string;
  }) => {
    createTask.mutate({
      projectId,
      ...data,
    }, {
      onSuccess: () => setTaskDialogOpen(false),
    });
  }, [createTask, projectId]);

  const handleEditTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  }, []);

  const handleUpdateTask = useCallback((data: Partial<Task> & { id: string }) => {
    updateTask.mutate(data, {
      onSuccess: () => {
        setTaskDialogOpen(false);
        setSelectedTask(null);
      },
    });
  }, [updateTask]);

  const handleStatusChange = useCallback((taskId: string, newStatus: TaskStatus) => {
    updateTask.mutate({ id: taskId, status: newStatus });
  }, [updateTask]);

  const handlePriorityChange = useCallback((taskId: string, newPriority: string) => {
    updateTask.mutate({ id: taskId, priority: newPriority as TaskPriority });
  }, [updateTask]);

  const openNewTaskDialog = useCallback((status?: TaskStatus) => {
    setSelectedTask(null);
    setDefaultStatus(status || "todo");
    setTaskDialogOpen(true);
  }, []);

  if (projectLoading || tasksLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (<Skeleton key={i} className="h-64 rounded-xl" />))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      <div className="p-6 pb-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{project?.emoji || "📋"}</span>
            <div>
              <h1 className="text-xl font-bold">{project?.name || "Project"}</h1>
              {project?.description && (
                <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
              )}
            </div>
            <Badge variant="secondary" className="ml-2">{project?.type}</Badge>
            <Button variant="ghost" size="icon" className="ml-2 h-8 w-8" onClick={() => setEditProjectOpen(true)}>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <Button onClick={() => openNewTaskDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>

        {/* View Tabs + Filters */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Tabs value={view} onValueChange={(v) => setView(v as "board" | "table" | "calendar")}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="board" className="gap-2 text-xs">
                <LayoutGrid className="h-3.5 w-3.5" />
                Board
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-2 text-xs">
                <Table2 className="h-3.5 w-3.5" />
                Table
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-8 h-8 w-48 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {TASK_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => v && setPriorityFilter(v)}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {TASK_PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-hidden p-6 pt-4">
        {view === "board" && (
          <KanbanBoard
            tasks={filteredTasks}
            onStatusChange={handleStatusChange}
            onEditTask={handleEditTask}
            onCreateTask={openNewTaskDialog}
            members={members || []}
          />
        )}
        {view === "table" && (
          <DataTableView
            tasks={filteredTasks}
            onEditTask={handleEditTask}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
          />
        )}
        {view === "calendar" && (
          <CalendarView
            tasks={filteredTasks}
            onEditTask={handleEditTask}
            onCreateTask={() => {
              setSelectedTask(null);
              setDefaultStatus("todo");
              setTaskDialogOpen(true);
            }}
          />
        )}
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) setSelectedTask(null);
        }}
        task={selectedTask}
        defaultStatus={defaultStatus}
        members={members || []}
        onSubmit={(data) => {
          if (selectedTask) {
            handleUpdateTask({ id: selectedTask.$id, ...data });
          } else {
            handleCreateTask(data);
          }
        }}
        isPending={createTask.isPending || updateTask.isPending}
      />

      <EditProjectModal
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        project={project}
      />
    </div>
  );
}
