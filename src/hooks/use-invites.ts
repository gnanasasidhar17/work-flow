"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import type { Invite } from "@/types";

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

export function useWorkspaceInvites(workspaceId: string | null) {
  return useQuery({
    queryKey: ["invites", workspaceId],
    queryFn: async () => {
      const data = await fetchWithUser(`/api/invites?workspaceId=${workspaceId}`);
      return data.data as Invite[];
    },
    enabled: !!workspaceId,
  });
}

export function useSendInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { workspaceId: string; email: string; role: string }) => {
      const data = await fetchWithUser("/api/invites", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return data.data as Invite;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invites", variables.workspaceId] });
      toast.success("Invite sent!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const data = await fetchWithUser(`/api/invites/${code}/accept`, {
        method: "POST",
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaceMembers"] });
      toast.success("Invite accepted!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
