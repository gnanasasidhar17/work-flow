"use client";

import { useMemo } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWorkspaceTasks } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useWorkspaceMembers } from "@/hooks/use-workspaces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  FolderKanban,
} from "lucide-react";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/constants";

export default function AnalyticsPage() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: tasks, isLoading } = useWorkspaceTasks(activeWorkspaceId);
  const { data: projects } = useProjects(activeWorkspaceId);
  const { data: members } = useWorkspaceMembers(activeWorkspaceId);

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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          icon={<BarChart3 className="h-5 w-5" />}
          colors="text-blue-600 bg-blue-50"
        />
        <StatCard
          title="Completed"
          value={stats?.completedTasks || 0}
          icon={<CheckCircle2 className="h-5 w-5" />}
          colors="text-emerald-600 bg-emerald-50"
          subtitle={`${stats?.completionRate || 0}% completion rate`}
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressTasks || 0}
          icon={<Clock className="h-5 w-5" />}
          colors="text-amber-600 bg-amber-50"
        />
        <StatCard
          title="Overdue"
          value={stats?.overdueTasks || 0}
          icon={<AlertCircle className="h-5 w-5" />}
          colors="text-red-600 bg-red-50"
        />
      </div>

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
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  colors: string;
  subtitle?: string;
}) {
  return (
    <Card>
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
