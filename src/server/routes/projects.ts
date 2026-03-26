import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite-server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/constants";

export const projectRoutes = new Hono()

  // GET /api/projects?workspaceId=xxx
  .get("/", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const workspaceId = c.req.query("workspaceId");
      if (!workspaceId) return c.json({ success: false, error: "workspaceId required" }, 400);

      const { databases } = createAdminClient();

      // SECURITY: Verify user is a member of this workspace
      const membership = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, [
        Query.equal("workspaceId", workspaceId),
        Query.equal("userId", userId),
      ]);
      if (membership.documents.length === 0) {
        return c.json({ success: false, error: "Forbidden: You are not a member of this workspace" }, 403);
      }

      const projects = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROJECTS, [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ]);

      return c.json({ success: true, data: projects.documents, total: projects.total });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // GET /api/projects/:id
  .get("/:id", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const id = c.req.param("id");
      const { databases } = createAdminClient();
      const project = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROJECTS, id);

      // SECURITY: Verify user is a member of this workspace
      const membership = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, [
        Query.equal("workspaceId", project.workspaceId),
        Query.equal("userId", userId),
      ]);
      if (membership.documents.length === 0) {
        return c.json({ success: false, error: "Forbidden: You are not a member of this workspace" }, 403);
      }

      return c.json({ success: true, data: project });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // POST /api/projects
  .post("/", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const body = await c.req.json();
      const { databases } = createAdminClient();

      // SECURITY: Verify user is a member
      const membership = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, [
        Query.equal("workspaceId", body.workspaceId),
        Query.equal("userId", userId),
      ]);
      if (membership.documents.length === 0) {
        return c.json({ success: false, error: "Forbidden" }, 403);
      }

      const project = await databases.createDocument(DATABASE_ID, COLLECTIONS.PROJECTS, ID.unique(), {
        workspaceId: body.workspaceId,
        name: body.name,
        description: body.description || "",
        type: body.type || "kanban",
        emoji: body.emoji || "📋",
      });

      return c.json({ success: true, data: project }, 201);
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // PATCH /api/projects/:id
  .patch("/:id", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const id = c.req.param("id");
      const body = await c.req.json();
      const { databases } = createAdminClient();

      const existingProject = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROJECTS, id);

      // SECURITY: Verify user is a member
      const membership = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, [
        Query.equal("workspaceId", existingProject.workspaceId),
        Query.equal("userId", userId),
      ]);
      if (membership.documents.length === 0) {
        return c.json({ success: false, error: "Forbidden" }, 403);
      }

      const project = await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROJECTS, id, {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.type && { type: body.type }),
        ...(body.emoji && { emoji: body.emoji }),
      });

      return c.json({ success: true, data: project });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // DELETE /api/projects/:id
  .delete("/:id", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const id = c.req.param("id");
      const { databases } = createAdminClient();

      const existingProject = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROJECTS, id);

      // SECURITY: Verify user is owner or admin to delete project
      const membership = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, [
        Query.equal("workspaceId", existingProject.workspaceId),
        Query.equal("userId", userId),
      ]);
      if (membership.documents.length === 0 || !["owner", "admin"].includes(membership.documents[0].role)) {
        return c.json({ success: false, error: "Forbidden: Only workspace admins can delete projects" }, 403);
      }

      // Delete all tasks for this project
      const tasks = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, [
        Query.equal("projectId", id),
        Query.limit(500),
      ]);
      for (const t of tasks.documents) {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TASKS, t.$id);
      }

      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PROJECTS, id);
      return c.json({ success: true });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  });
