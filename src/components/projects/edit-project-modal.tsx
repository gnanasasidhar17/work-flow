"use client";

import { useState, useEffect } from "react";
import { useUpdateProject, useDeleteProject } from "@/hooks/use-projects";
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
import { Project } from "@/types";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function EditProjectModal({ 
  open, 
  onOpenChange, 
  project
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  project: Project | undefined;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("kanban");
  const [emoji, setEmoji] = useState("📋");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const router = useRouter();

  useEffect(() => {
    if (open && project) {
      setName(project.name);
      setDescription(project.description || "");
      setType(project.type);
      setEmoji(project.emoji || "📋");
      setDeleteConfirm("");
    }
  }, [project, open]);

  const handleSubmit = () => {
    if (!name.trim() || !project) return;
    updateProject.mutate({
      id: project.$id,
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

  const handleDelete = () => {
    if (!project || deleteConfirm !== project.name) return;
    deleteProject.mutate(project.$id, {
      onSuccess: () => {
        onOpenChange(false);
        router.push(`/dashboard`);
      },
    });
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update project details</DialogDescription>
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
            <Label htmlFor="editProjName">Name</Label>
            <Input
              id="editProjName"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editProjDesc">Description</Label>
            <Textarea
              id="editProjDesc"
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
          
          <div className="pt-4 border-t border-border mt-4">
            <Label className="text-destructive mb-2 block">Danger Zone</Label>
            <div className="flex items-center gap-2">
               <Input 
                 placeholder={`Type "${project.name}" to delete`}
                 value={deleteConfirm}
                 onChange={(e) => setDeleteConfirm(e.target.value)}
                 className="flex-1"
               />
               <Button 
                 variant="destructive" 
                 onClick={handleDelete}
                 disabled={deleteConfirm !== project.name || deleteProject.isPending}
               >
                 <Trash2 className="h-4 w-4 mr-2" />
                 Delete
               </Button>
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={updateProject.isPending || !name.trim()}>
            {updateProject.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
