import type { TaskStatus, TaskPriority } from "@/types";

// ============================================================
// Appwrite Configuration Constants
// ============================================================
export const DATABASE_ID = "69c169e00027c7b6a817";

// Table names must match exactly what you created in Appwrite console
export const TABLES = {
  WORKSPACES: "workspaces",
  WORKSPACE_MEMBERS: "workspace_members",
  PROJECTS: "projects",
  TASKS: "tasks",
  COMMENTS: "comments",
  ATTACHMENTS: "attachments",
  INVITES: "invites",
} as const;

// For backwards compatibility
export const COLLECTIONS = TABLES;

export const STORAGE_BUCKETS = {
  AVATARS: "avatars",
  ATTACHMENTS: "attachments",
} as const;

// ============================================================
// Task Status Configuration
// ============================================================
export const TASK_STATUSES: {
  value: TaskStatus;
  label: string;
  color: string;
  bgColor: string;
}[] = [
  {
    value: "todo",
    label: "To Do",
    color: "#6B7280",
    bgColor: "bg-gray-100 text-gray-700",
  },
  {
    value: "in-progress",
    label: "In Progress",
    color: "#3B82F6",
    bgColor: "bg-blue-50 text-blue-700",
  },
  {
    value: "in-review",
    label: "In Review",
    color: "#F59E0B",
    bgColor: "bg-amber-50 text-amber-700",
  },
  {
    value: "done",
    label: "Done",
    color: "#10B981",
    bgColor: "bg-emerald-50 text-emerald-700",
  },
];

// ============================================================
// Task Priority Configuration
// ============================================================
export const TASK_PRIORITIES: {
  value: TaskPriority;
  label: string;
  color: string;
  icon: string;
}[] = [
  { value: "low", label: "Low", color: "#6B7280", icon: "ArrowDown" },
  { value: "medium", label: "Medium", color: "#F59E0B", icon: "ArrowRight" },
  { value: "high", label: "High", color: "#EF4444", icon: "ArrowUp" },
  { value: "urgent", label: "Urgent", color: "#DC2626", icon: "AlertTriangle" },
];

// ============================================================
// Navigation Items
// ============================================================
export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Analytics", href: "/analytics", icon: "BarChart3" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;

export const PROJECT_EMOJIS = [
  "📋", "🚀", "💡", "🎯", "🔥", "⚡", "🎨", "🛠️",
  "📊", "🌟", "💻", "📱", "🎮", "🏗️", "📦", "🔬",
];
