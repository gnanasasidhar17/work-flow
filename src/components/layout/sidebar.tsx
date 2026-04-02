"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useProjects } from "@/hooks/use-projects";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  ChevronDown,
  Plus,
  FolderKanban,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeWorkspaceId, setActiveWorkspace, setActiveProject, sidebarOpen, toggleSidebar } = useWorkspaceStore();
  const { data: workspaces, isLoading: wsLoading } = useWorkspaces();
  const { data: projects, isLoading: projLoading } = useProjects(activeWorkspaceId);
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const activeWorkspace = workspaces?.find((w) => w.$id === activeWorkspaceId);

  // Auto-select first workspace if none selected
  if (!activeWorkspaceId && workspaces && workspaces.length > 0) {
    setActiveWorkspace(workspaces[0].$id);
  }

  if (!sidebarOpen) {
    return (
      <div className="h-screen w-14 border-r border-border bg-sidebar flex flex-col items-center py-4 gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mb-2">
          <PanelLeft className="h-4 w-4" />
        </Button>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
            >
              <item.icon className="h-4 w-4" />
            </Button>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="h-screen w-64 border-r border-border bg-sidebar flex flex-col">
      {/* App Logo */}
      <div className="px-6 pt-6 pb-2">
        <svg id="logo-38" width="85" height="35" viewBox="0 0 78 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
          <path d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z" className="ccustom" fill="#FF7A00" />
          <path d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z" className="ccompli1" fill="#FF9736" />
          <path d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z" className="ccompli2" fill="#FFBC7D" />
        </svg>
      </div>

      {/* Workspace Switcher */}
      <div className="px-4 pb-4 pt-2 flex items-center justify-between gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="flex items-center justify-between w-full rounded-lg px-2 py-2 text-sm font-semibold hover:bg-muted transition-colors outline-none cursor-pointer"
              />
            }
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {activeWorkspace?.name?.charAt(0)?.toUpperCase() || "W"}
              </div>
              <span className="truncate text-sm">{activeWorkspace?.name || "Select Workspace"}</span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {workspaces?.map((ws) => (
              <DropdownMenuItem
                key={ws.$id}
                onClick={() => {
                  setActiveWorkspace(ws.$id);
                  router.push("/dashboard");
                }}
                className={cn(ws.$id === activeWorkspaceId && "bg-accent")}
              >
                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary mr-2">
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                {ws.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard?create=workspace")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={toggleSidebar}>
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-9 text-sm font-medium",
                  pathname === item.href && "bg-accent text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Projects Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Projects
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setCreateProjectOpen(true)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {projLoading ? (
            <div className="space-y-2 px-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="space-y-1">
              {projects.map((project) => {
                const href = `/workspace/${activeWorkspaceId}/project/${project.$id}`;
                const isActive = pathname === href;
                return (
                  <Link key={project.$id} href={href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-2 h-9 text-sm",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => setActiveProject(project.$id)}
                    >
                      <span className="text-base">{project.emoji || "📋"}</span>
                      <span className="truncate">{project.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground px-2 py-4">
              No projects yet. Create one to get started.
            </p>
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* User Section */}
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 w-full rounded-lg p-2 text-left hover:bg-muted transition-colors outline-none cursor-pointer" />
            }
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-left">
              <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CreateProjectModal
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        workspaceId={activeWorkspaceId}
      />
    </div>
  );
}
