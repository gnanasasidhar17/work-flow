"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import type { Task, TaskStatus, TaskPriority } from "@/types";

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

export function useTasks(filters?: {
  projectId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.projectId) params.set("projectId", filters.projectId);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.priority) params.set("priority", filters.priority);
  if (filters?.assigneeId) params.set("assigneeId", filters.assigneeId);
  if (filters?.search) params.set("search", filters.search);

  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const data = await fetchWithUser(`/api/tasks?${params.toString()}`);
      return data.data as Task[];
    },
    enabled: !!filters?.projectId,
  });
}

export function useWorkspaceTasks(workspaceId: string | null) {
  return useQuery({
    queryKey: ["workspaceTasks", workspaceId],
    queryFn: async () => {
      const data = await fetchWithUser(`/api/tasks/workspace/${workspaceId}`);
      return data.data as Task[];
    },
    enabled: !!workspaceId,
  });
}

export function useTask(taskId: string | null) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const data = await fetchWithUser(`/api/tasks/${taskId}`);
      return data.data;
    },
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      projectId: string;
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string;
      dueDate?: string;
      labels?: string[];
    }) => {
      const data = await fetchWithUser("/api/tasks", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return data.data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["workspaceTasks"] });
      toast.success("Task created!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: {
      id: string;
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string;
      dueDate?: string;
      position?: number;
      labels?: string[];
    }) => {
      const data = await fetchWithUser(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return data.data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["workspaceTasks"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchWithUser(`/api/tasks/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["workspaceTasks"] });
      toast.success("Task deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }) => {
      const data = await fetchWithUser(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
      toast.success("Comment added");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
