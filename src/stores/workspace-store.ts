"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkspaceState {
  activeWorkspaceId: string | null;
  activeProjectId: string | null;
  sidebarOpen: boolean;
  setActiveWorkspace: (id: string | null) => void;
  setActiveProject: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      activeProjectId: null,
      sidebarOpen: true,
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id, activeProjectId: null }),
      setActiveProject: (id) => set({ activeProjectId: id }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "workflow-workspace",
      partialize: (state) => ({
        activeWorkspaceId: state.activeWorkspaceId,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
);
