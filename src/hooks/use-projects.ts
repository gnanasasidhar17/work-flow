"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import type { Project } from "@/types";

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

export function useProjects(workspaceId: string | null) {
  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      const data = await fetchWithUser(`/api/projects?workspaceId=${workspaceId}`);
      return data.data as Project[];
    },
    enabled: !!workspaceId,
  });
}

export function useProject(projectId: string | null) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const data = await fetchWithUser(`/api/projects/${projectId}`);
      return data.data as Project;
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      workspaceId: string;
      name: string;
      description?: string;
      type?: string;
      emoji?: string;
    }) => {
      const data = await fetchWithUser("/api/projects", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return data.data as Project;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.workspaceId] });
      toast.success("Project created!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; name?: string; description?: string; type?: string; emoji?: string }) => {
      const data = await fetchWithUser(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return data.data as Project;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
      toast.success("Project updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchWithUser(`/api/projects/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
