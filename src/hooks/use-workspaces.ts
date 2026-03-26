"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import type { Workspace, WorkspaceMember } from "@/types";

const fetchWithUser = async (url: string, options?: RequestInit) => {
  const user = useAuthStore.getState().user;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": user?.$id || "",
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Request failed");
  return data;
};

export function useWorkspaces() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const data = await fetchWithUser("/api/workspaces");
      return data.data as Workspace[];
    },
    enabled: !!user,
  });
}

export function useWorkspaceMembers(workspaceId: string | null) {
  return useQuery({
    queryKey: ["workspaceMembers", workspaceId],
    queryFn: async () => {
      const data = await fetchWithUser(`/api/workspaces/${workspaceId}/members`);
      return data.data as WorkspaceMember[];
    },
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { name: string; logoFileId?: string }) => {
      const data = await fetchWithUser("/api/workspaces", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return data.data as Workspace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Workspace created!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; name?: string; logoFileId?: string }) => {
      const data = await fetchWithUser(`/api/workspaces/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return data.data as Workspace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Workspace updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchWithUser(`/api/workspaces/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Workspace deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ----------------- INVITATIONS -----------------

export interface Invite {
  $id: string;
  workspaceId: string;
  workspaceName?: string;
  email: string;
  role: string;
  code: string;
  status: string;
  $createdAt: string;
}

export function useMyInvites() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["myInvites"],
    queryFn: async () => {
      const data = await fetchWithUser("/api/invites/me");
      return data.data as Invite[];
    },
    enabled: !!user,
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const data = await fetchWithUser(`/api/invites/${code}/accept`, { method: "POST" });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInvites"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Invite accepted! You are now a member.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeclineInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const data = await fetchWithUser(`/api/invites/${code}/decline`, { method: "POST" });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInvites"] });
      toast.success("Invite declined");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
