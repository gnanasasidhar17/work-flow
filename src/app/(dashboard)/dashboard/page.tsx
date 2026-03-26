"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useProjects } from "@/hooks/use-projects";
import { useWorkspaceTasks } from "@/hooks/use-tasks";
import { useCreateWorkspace } from "@/hooks/use-workspaces";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore();
  const { data: workspaces, isLoading: wsLoading } = useWorkspaces();
  const { data: projects, isLoading: projLoading } = useProjects(activeWorkspaceId);
  const { data: tasks } = useWorkspaceTasks(activeWorkspaceId);

  const [wsDialogOpen, setWsDialogOpen] = useState(false);
  const [projDialogOpen, setProjDialogOpen] = useState(false);
  const [wsName, setWsName] = useState("");

  const createWorkspace = useCreateWorkspace();

  // Handle URL params for creating workspace/project
  useEffect(() => {
    const create = searchParams.get("create");
    if (create === "workspace") setWsDialogOpen(true);
    if (create === "project") setProjDialogOpen(true);
  }, [searchParams]);

  // Auto-select first workspace
  useEffect(() => {
    if (!activeWorkspaceId && workspaces && workspaces.length > 0) {
      setActiveWorkspace(workspaces[0].$id);
    }
  }, [workspaces, activeWorkspaceId, setActiveWorkspace]);

  const handleCreateWorkspace = () => {
    if (!wsName.trim()) return;
    createWorkspace.mutate({ name: wsName }, {
      onSuccess: (data) => {
        setWsDialogOpen(false);
        setWsName("");
        setActiveWorkspace(data.$id);
      },
    });
  };

  // Stats
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((t) => t.status === "done").length || 0;
  const inProgressTasks = tasks?.filter((t) => t.status === "in-progress").length || 0;
  const overdueTasks = tasks?.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length || 0;

  if (wsLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // No workspaces state
  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Welcome to Work-flow</h2>
            <p className="text-muted-foreground text-sm">
              Create your first workspace to start managing projects.
            </p>
            <Button onClick={() => setWsDialogOpen(true)} className="mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Create Workspace
            </Button>
          </CardContent>
        </Card>

        <CreateWorkspaceDialog
          open={wsDialogOpen}
          onOpenChange={setWsDialogOpen}
          name={wsName}
          setName={setWsName}
          onSubmit={handleCreateWorkspace}
          isPending={createWorkspace.isPending}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of your workspace activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setWsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Workspace
          </Button>
          <Button onClick={() => setProjDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tasks"
          value={totalTasks}
          icon={<BarChart3 className="h-5 w-5" />}
          color="text-blue-600 bg-blue-50"
        />
        <StatsCard
          title="Completed"
          value={completedTasks}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="text-emerald-600 bg-emerald-50"
        />
        <StatsCard
          title="In Progress"
          value={inProgressTasks}
          icon={<Clock className="h-5 w-5" />}
          color="text-amber-600 bg-amber-50"
        />
        <StatsCard
          title="Overdue"
          value={overdueTasks}
          icon={<AlertCircle className="h-5 w-5" />}
          color="text-red-600 bg-red-50"
        />
      </div>

      {/* Projects Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Projects</h2>
          <Button variant="ghost" size="sm" onClick={() => setProjDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {projLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.$id}
                href={`/workspace/${activeWorkspaceId}/project/${project.$id}`}
              >
                <Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/30 cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-xl">
                        {project.emoji || "📋"}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {project.type}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description || "No description"}
                    </p>
                    <div className="mt-4 flex items-center text-sm text-muted-foreground">
                      <span>View project</span>
                      <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground text-sm">No projects yet</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setProjDialogOpen(true)}>
                <Plus className="h-3 w-3 mr-1" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Workspace Dialog */}
      <CreateWorkspaceDialog
        open={wsDialogOpen}
        onOpenChange={setWsDialogOpen}
        name={wsName}
        setName={setWsName}
        onSubmit={handleCreateWorkspace}
        isPending={createWorkspace.isPending}
      />

      <CreateProjectModal
        open={projDialogOpen}
        onOpenChange={setProjDialogOpen}
        workspaceId={activeWorkspaceId}
      />
    </div>
  );
}

function StatsCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateWorkspaceDialog({
  open, onOpenChange, name, setName, onSubmit, isPending,
}: {
  open: boolean; onOpenChange: (open: boolean) => void; name: string; setName: (name: string) => void; onSubmit: () => void; isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>Workspaces are shared environments for your team</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="wsName">Workspace Name</Label>
            <Input
              id="wsName"
              placeholder="My Workspace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit} disabled={isPending || !name.trim()}>
            {isPending ? "Creating..." : "Create Workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
