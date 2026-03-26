"use client";

import { useParams } from "next/navigation";
import { useProjects } from "@/hooks/use-projects";
import { useWorkspaceMembers } from "@/hooks/use-workspaces";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ArrowRight, FolderKanban } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { setActiveWorkspace } = useWorkspaceStore();
  const { data: projects, isLoading: projLoading } = useProjects(workspaceId);
  const { data: members } = useWorkspaceMembers(workspaceId);

  useEffect(() => {
    setActiveWorkspace(workspaceId);
  }, [workspaceId, setActiveWorkspace]);

  if (projLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workspace</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {projects?.length || 0} projects · {members?.length || 0} members
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Member Avatars */}
          <div className="flex -space-x-2">
            {members?.slice(0, 5).map((m) => (
              <Avatar key={m.$id} className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {m.userName?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            ))}
            {members && members.length > 5 && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                +{members.length - 5}
              </div>
            )}
          </div>
          <Link href="/dashboard?create=project">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Projects Grid */}
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.$id}
              href={`/workspace/${workspaceId}/project/${project.$id}`}
            >
              <Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/30 cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-2xl">
                      {project.emoji || "📋"}
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {project.type}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {project.description || "No description yet"}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>Open project</span>
                    <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium mb-1">No projects yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first project to start tracking tasks
            </p>
            <Link href="/dashboard?create=project">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
