// ============================================================
// Work-flow — Core Type Definitions
// ============================================================

export type Role = "owner" | "admin" | "member";
export type TaskStatus = "todo" | "in-progress" | "in-review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type ProjectType = "scrum" | "kanban";
export type InviteStatus = "pending" | "accepted" | "declined";

// ---------- User ----------
export interface User {
  $id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

// ---------- Workspace ----------
export interface Workspace {
  $id: string;
  name: string;
  ownerId: string;
  logoFileId?: string;
  logoUrl?: string;
  $createdAt: string;
}

// ---------- Workspace Member ----------
export interface WorkspaceMember {
  $id: string;
  workspaceId: string;
  userId: string;
  role: Role;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  joinedAt: string;
}

// ---------- Project ----------
export interface Project {
  $id: string;
  workspaceId: string;
  name: string;
  description: string;
  type: ProjectType;
  emoji?: string;
  $createdAt: string;
}

// ---------- Task ----------
export interface Task {
  $id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  dueDate?: string;
  position: number;
  labels?: string[];
  $createdAt: string;
}

// ---------- Comment ----------
export interface Comment {
  $id: string;
  taskId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  content: string;
  $createdAt: string;
}

// ---------- Attachment ----------
export interface Attachment {
  $id: string;
  taskId: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  $createdAt: string;
}

// ---------- Invite ----------
export interface Invite {
  $id: string;
  workspaceId: string;
  email: string;
  role: Role;
  code: string;
  status: InviteStatus;
  $createdAt: string;
}

// ---------- Column (Kanban) ----------
export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

// ---------- API Response ----------
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}

// ---------- Analytics ----------
export interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  tasksByMember: { name: string; completed: number; pending: number }[];
  completionOverTime: { date: string; completed: number }[];
}
