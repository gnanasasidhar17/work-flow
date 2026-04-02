"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWorkspaceTasks } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useWorkspaceMembers } from "@/hooks/use-workspaces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  FolderKanban,
  X,
  ArrowUpDown,
  Calendar,
} from "lucide-react";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/constants";
import type { Task } from "@/types";

type FilterType = "all" | "completed" | "in-progress" | "overdue" | null;

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: tasks, isLoading } = useWorkspaceTasks(activeWorkspaceId);
  const { data: projects } = useProjects(activeWorkspaceId);
  const { data: members } = useWorkspaceMembers(activeWorkspaceId);

  const [activeFilter, setActiveFilter] = useState<FilterType>(null);

  // Read filter from URL on mount
  useEffect(() => {
    const filter = searchParams.get("filter") as FilterType;
    if (filter) {
      setActiveFilter(filter);
    }
  }, [searchParams]);

  const handleFilterClick = (filter: FilterType) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
      router.replace("/analytics", { scroll: false });
    } else {
      setActiveFilter(filter);
      router.replace(`/analytics?filter=${filter}`, { scroll: false });
    }
  };

  const stats = useMemo(() => {
    if (!tasks) return null;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
    ).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Tasks by status
    const byStatus = TASK_STATUSES.map((s) => ({
      ...s,
      count: tasks.filter((t) => t.status === s.value).length,
    }));

    // Tasks by priority
    const byPriority = TASK_PRIORITIES.map((p) => ({
      ...p,
      count: tasks.filter((t) => t.priority === p.value).length,
    }));

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate,
      byStatus,
      byPriority,
    };
  }, [tasks]);

  // Filter tasks based on active filter
  const filteredTasks = useMemo(() => {
    if (!tasks || !activeFilter) return [];

    switch (activeFilter) {
      case "all":
        return tasks;
      case "completed":
        return tasks.filter((t) => t.status === "done");
      case "in-progress":
        return tasks.filter((t) => t.status === "in-progress");
      case "overdue":
        return tasks.filter(
          (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
        );
      default:
        return [];
    }
  }, [tasks, activeFilter]);

  const filterLabel: Record<string, string> = {
    all: "All Tasks",
    completed: "Completed Tasks",
    "in-progress": "In Progress Tasks",
    overdue: "Overdue Tasks",
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Workspace performance overview</p>
      </div>

      {/* Overview Stats - Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          icon={<BarChart3 className="h-5 w-5" />}
          colors="text-blue-600 bg-blue-50"
          active={activeFilter === "all"}
          onClick={() => handleFilterClick("all")}
        />
        <StatCard
          title="Completed"
          value={stats?.completedTasks || 0}
          icon={<CheckCircle2 className="h-5 w-5" />}
          colors="text-emerald-600 bg-emerald-50"
          subtitle={`${stats?.completionRate || 0}% completion rate`}
          active={activeFilter === "completed"}
          onClick={() => handleFilterClick("completed")}
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressTasks || 0}
          icon={<Clock className="h-5 w-5" />}
          colors="text-amber-600 bg-amber-50"
          active={activeFilter === "in-progress"}
          onClick={() => handleFilterClick("in-progress")}
        />
        <StatCard
          title="Overdue"
          value={stats?.overdueTasks || 0}
          icon={<AlertCircle className="h-5 w-5" />}
          colors="text-red-600 bg-red-50"
          active={activeFilter === "overdue"}
          onClick={() => handleFilterClick("overdue")}
        />
      </div>

      {/* Filtered Task List */}
      {activeFilter && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                {filterLabel[activeFilter] || "Tasks"}
                <Badge variant="secondary" className="ml-1">{filteredTasks.length}</Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveFilter(null);
                  router.replace("/analytics", { scroll: false });
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No tasks match this filter.
              </p>
            ) : (
              <div className="space-y-1">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_120px_100px_120px] gap-3 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>Task</span>
                  <span>Status</span>
                  <span>Priority</span>
                  <span>Due Date</span>
                </div>
                <Separator />
                {/* Task Rows */}
                {filteredTasks.map((task) => (
                  <TaskRow key={task.$id} task={task} projects={projects || []} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.byStatus.map((item) => (
                <div key={item.value} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.label}</span>
                    </div>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stats?.totalTasks ? (item.count / stats.totalTasks) * 100 : 0}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tasks by Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.byPriority.map((item) => (
                <div key={item.value} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.label}</span>
                    </div>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stats?.totalTasks ? (item.count / stats.totalTasks) * 100 : 0}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workspace Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workspace Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FolderKanban className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{projects?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{members?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Members</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(stats?.completionRate || 0) * 3.52} 352`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{stats?.completionRate || 0}%</span>
                  <span className="text-xs text-muted-foreground">Complete</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  colors,
  subtitle,
  active,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  colors: string;
  subtitle?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        active ? "ring-2 ring-primary border-primary/50 shadow-md" : "hover:border-primary/30"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskRow({ task, projects }: { task: Task; projects: { $id: string; name: string; emoji?: string }[] }) {
  const project = projects.find((p) => p.$id === task.projectId);
  const statusConfig = TASK_STATUSES.find((s) => s.value === task.status);
  const priorityConfig = TASK_PRIORITIES.find((p) => p.value === task.priority);

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <div className="grid grid-cols-[1fr_120px_100px_120px] gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors items-center text-sm">
      <div className="min-w-0">
        <p className="font-medium truncate">{task.title}</p>
        {project && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {project.emoji || "📋"} {project.name}
          </p>
        )}
      </div>
      <div>
        <Badge
          variant="secondary"
          className="text-xs font-medium"
          style={{
            backgroundColor: statusConfig?.color + "18",
            color: statusConfig?.color,
            borderColor: statusConfig?.color + "30",
          }}
        >
          {statusConfig?.label || task.status}
        </Badge>
      </div>
      <div>
        <Badge
          variant="secondary"
          className="text-xs font-medium"
          style={{
            backgroundColor: priorityConfig?.color + "18",
            color: priorityConfig?.color,
            borderColor: priorityConfig?.color + "30",
          }}
        >
          {priorityConfig?.label || task.priority}
        </Badge>
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        {task.dueDate ? (
          <span className={`flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}
