"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWorkspaces, useUpdateWorkspace, useDeleteWorkspace, useWorkspaceMembers } from "@/hooks/use-workspaces";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Settings, Users, Trash2, Mail, Shield, Crown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();
  const { data: members } = useWorkspaceMembers(activeWorkspaceId);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const activeWorkspace = workspaces?.find((w) => w.$id === activeWorkspaceId);
  const currentMember = members?.find((m) => m.userId === user?.$id);
  const isOwner = currentMember?.role === "owner";
  const isAdmin = currentMember?.role === "admin" || isOwner;

  const [wsName, setWsName] = useState(activeWorkspace?.name || "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const updateWorkspace = useUpdateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();

  const handleUpdateName = () => {
    if (!activeWorkspaceId || !wsName.trim()) return;
    updateWorkspace.mutate({ id: activeWorkspaceId, name: wsName });
  };

  const handleDelete = () => {
    if (!activeWorkspaceId || deleteConfirm !== activeWorkspace?.name) return;
    deleteWorkspace.mutate(activeWorkspaceId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setActiveWorkspace(null);
        router.push("/dashboard");
      },
    });
  };

  const handleInvite = async () => {
    if (!inviteEmail || !activeWorkspaceId) return;
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.$id || "",
        },
        body: JSON.stringify({
          workspaceId: activeWorkspaceId,
          email: inviteEmail,
          role: inviteRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Invite sent to ${inviteEmail}`);
        setInviteEmail("");
      } else {
        toast.error(data.error || "Failed to send invite");
      }
    } catch {
      toast.error("Failed to send invite");
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-muted-foreground">Select a workspace first</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your workspace settings</p>
      </div>

      {/* Workspace Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </CardTitle>
          <CardDescription>Update your workspace information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Workspace Name</Label>
            <div className="flex gap-2">
              <Input
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                placeholder="Workspace name"
                disabled={!isAdmin}
              />
              <Button onClick={handleUpdateName} disabled={!isAdmin || updateWorkspace.isPending}>
                {updateWorkspace.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </CardTitle>
          <CardDescription>Manage workspace members and roles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Invite */}
          {isAdmin && (
            <div className="flex gap-2">
              <Input
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={inviteRole} onValueChange={(v) => v && setInviteRole(v)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </div>
          )}

          <Separator />

          {/* Members List */}
          <div className="space-y-3">
            {members?.map((member) => (
              <div key={member.$id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {member.userName?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.userName || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{member.userEmail}</p>
                  </div>
                </div>
                <Badge
                  variant={member.role === "owner" ? "default" : "secondary"}
                  className="capitalize text-xs"
                >
                  {member.role === "owner" && <Crown className="h-3 w-3 mr-1" />}
                  {member.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isOwner && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              Delete Workspace
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{activeWorkspace.name}</strong> and all its
              projects, tasks, and data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Type <strong>{activeWorkspace.name}</strong> to confirm</Label>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={activeWorkspace.name}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteConfirm !== activeWorkspace.name || deleteWorkspace.isPending}
            >
              {deleteWorkspace.isPending ? "Deleting..." : "Delete Workspace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
