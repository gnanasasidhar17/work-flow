"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, formatDistanceToNow } from "date-fns";
import { CalendarIcon, Loader2, MessageSquare } from "lucide-react";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useTask, useAddComment } from "@/hooks/use-tasks";
import type { Task, TaskStatus, TaskPriority, WorkspaceMember } from "@/types";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  defaultStatus: TaskStatus;
  members: WorkspaceMember[];
  onSubmit: (data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    dueDate?: string;
  }) => void;
  isPending: boolean;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultStatus,
  members,
  onSubmit,
  isPending,
}: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [commentText, setCommentText] = useState("");

  const { data: fullTask, isLoading: taskLoading } = useTask(task?.$id || null);
  const addComment = useAddComment();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId || "");
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    } else {
      setTitle("");
      setDescription("");
      setStatus(defaultStatus);
      setPriority("medium");
      setAssigneeId("");
      setDueDate(undefined);
      setCommentText("");
    }
  }, [task, defaultStatus, open]);

  const handleAddComment = () => {
    if (!commentText.trim() || !task) return;
    addComment.mutate({ taskId: task.$id, content: commentText }, {
      onSuccess: () => setCommentText("")
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title,
      description,
      status,
      priority,
      assigneeId: assigneeId || undefined,
      dueDate: dueDate?.toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => v && setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={assigneeId} onValueChange={(v) => v && setAssigneeId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.userName || m.userEmail || m.userId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger render={<Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  />}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "MMM d, yyyy") : "Pick a date"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {task && (
            <div className="pt-4 border-t border-border mt-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <Label>Comments</Label>
              </div>
              <div className="flex gap-2 mb-4">
                <Input 
                  placeholder="Add a comment..." 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || addComment.isPending}
                >
                  {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                </Button>
              </div>

              {taskLoading ? (
                 <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto my-4" />
              ) : fullTask?.comments && fullTask.comments.length > 0 ? (
                <ScrollArea className="h-[150px] pr-4">
                  <div className="space-y-3">
                    {fullTask.comments.map((comment: any) => {
                      const user = members.find(m => m.userId === comment.userId);
                      return (
                        <div key={comment.$id} className="bg-muted/30 p-3 rounded-lg text-sm border border-border/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs">{user?.userName || "User"}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.$createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs mt-1">{comment.content}</p>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4 bg-muted/20 rounded-lg border border-dashed border-border">
                  No comments yet. Start the discussion!
                </p>
              )}
            </div>
          )}

          <DialogFooter className="pt-4 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {task ? "Updating..." : "Creating..."}
                </>
              ) : (
                task ? "Update Task" : "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
