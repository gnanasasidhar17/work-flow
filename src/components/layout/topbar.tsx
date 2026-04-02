"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Moon, Sun, FolderKanban, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWorkspaceTasks } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useMyInvites, useAcceptInvite, useDeclineInvite } from "@/hooks/use-workspaces";
import { useLogout } from "@/hooks/use-auth";
import { Settings, LogOut, User as UserIcon } from "lucide-react";

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: tasks } = useWorkspaceTasks(activeWorkspaceId);
  const { data: projects } = useProjects(activeWorkspaceId);
  
  const { data: invites } = useMyInvites();
  const acceptInvite = useAcceptInvite();
  const declineInvite = useDeclineInvite();

  const { mutate: logout } = useLogout();
  const router = useRouter();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <div className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div
            className="relative cursor-pointer"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <div className="h-9 pl-9 pr-4 rounded-lg border border-border bg-muted/50 flex items-center text-sm text-muted-foreground hover:bg-muted transition-colors">
              Search tasks, projects...
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 ml-4">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<button className="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-muted transition-colors relative outline-none cursor-pointer" />}>
              <Bell className="h-4 w-4" />
              {invites && invites.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-semibold">Notifications</p>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {!invites || invites.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center">No new notifications</p>
                ) : (
                  invites.map((invite) => (
                    <div key={invite.$id} className="p-3 border-b border-border last:border-0 flex flex-col gap-2">
                      <p className="text-sm">
                        You have been invited to join <strong>{invite.workspaceName || "a workspace"}</strong> as {invite.role}.
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Button 
                          size="sm" 
                          onClick={() => acceptInvite.mutate(invite.code)} 
                          disabled={acceptInvite.isPending || declineInvite.isPending}
                        >
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => declineInvite.mutate(invite.code)} 
                          disabled={acceptInvite.isPending || declineInvite.isPending}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger render={<button className="inline-flex items-center justify-center h-9 w-9 rounded-full p-0 hover:bg-muted transition-colors outline-none cursor-pointer" />}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
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
      </div>

      {/* Command Palette (Search) */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search tasks, projects, or workspaces..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {projects && projects.length > 0 && (
            <CommandGroup heading="Projects">
              {projects.map((p) => (
                <CommandItem key={p.$id} onSelect={() => {
                  setSearchOpen(false);
                  router.push(`/workspace/${activeWorkspaceId}/project/${p.$id}`);
                }}>
                  <FolderKanban className="mr-2 h-4 w-4 text-muted-foreground" />
                  {p.emoji} {p.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {tasks && tasks.length > 0 && (
            <CommandGroup heading="Tasks">
              {tasks.map((t) => (
                <CommandItem key={t.$id} onSelect={() => {
                  setSearchOpen(false);
                  router.push(`/workspace/${activeWorkspaceId}/project/${t.projectId}`);
                }}>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  {t.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => { setSearchOpen(false); router.push("/dashboard?create=task"); }}>
              Create New Task
            </CommandItem>
            <CommandItem onSelect={() => { setSearchOpen(false); router.push("/dashboard?create=project"); }}>
              Create New Project
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
