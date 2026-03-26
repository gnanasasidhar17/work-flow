"use client";

import { useState, useEffect } from "react";
import { useCreateProject } from "@/hooks/use-projects";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { PROJECT_EMOJIS } from "@/lib/constants";

export function CreateProjectModal({ 
  open, 
  onOpenChange, 
  workspaceId 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  workspaceId: string | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("kanban");
  const [emoji, setEmoji] = useState("📋");

  const createProject = useCreateProject();

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setType("kanban");
      setEmoji("📋");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim() || !workspaceId) return;
    createProject.mutate({
      workspaceId,
      name,
      description,
      type,
      emoji,
    }, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>Add a new project to your workspace</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Emoji</Label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg hover:bg-accent transition-colors ${
                    emoji === e ? "bg-accent ring-2 ring-primary" : ""
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="createProjName">Name</Label>
            <Input
              id="createProjName"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="createProjDesc">Description</Label>
            <Textarea
              id="createProjDesc"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => v && setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kanban">Kanban</SelectItem>
                <SelectItem value="scrum">Scrum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createProject.isPending || !name.trim() || !workspaceId}>
            {createProject.isPending ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
