import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite-server";
import { DATABASE_ID, COLLECTIONS, STORAGE_BUCKETS } from "@/lib/constants";

export const taskRoutes = new Hono()

  // GET /api/tasks?projectId=xxx&status=xxx&priority=xxx&assigneeId=xxx&search=xxx
  .get("/", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const projectId = c.req.query("projectId");
      const status = c.req.query("status");
      const priority = c.req.query("priority");
      const assigneeId = c.req.query("assigneeId");
      const search = c.req.query("search");

      const queries: any[] = [Query.orderAsc("position"), Query.limit(500)];

      if (projectId) queries.push(Query.equal("projectId", projectId));
      if (status) queries.push(Query.equal("status", status));
      if (priority) queries.push(Query.equal("priority", priority));
      if (assigneeId) queries.push(Query.equal("assigneeId", assigneeId));
      if (search) queries.push(Query.search("title", search));

      const { databases } = createAdminClient();
      const tasks = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, queries);

      return c.json({ success: true, data: tasks.documents, total: tasks.total });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // GET /api/tasks/workspace/:workspaceId - Get all tasks for a workspace
  .get("/workspace/:workspaceId", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const workspaceId = c.req.param("workspaceId");
      const { databases } = createAdminClient();

      // SECURITY: Verify user is a member of this workspace
      const membership = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, [
        Query.equal("workspaceId", workspaceId),
        Query.equal("userId", userId),
      ]);
      if (membership.documents.length === 0) {
        return c.json({ success: false, error: "Forbidden: You are not a member of this workspace" }, 403);
      }

      // First get all projects in this workspace
      const projects = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROJECTS, [
        Query.equal("workspaceId", workspaceId),
        Query.limit(100),
      ]);

      if (projects.documents.length === 0) {
        return c.json({ success: true, data: [], total: 0 });
      }

      const projectIds = projects.documents.map((p) => p.$id);
      const tasks = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, [
        Query.equal("projectId", projectIds),
        Query.orderDesc("$createdAt"),
        Query.limit(500),
      ]);

      return c.json({ success: true, data: tasks.documents, total: tasks.total });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // GET /api/tasks/:id
  .get("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const { databases } = createAdminClient();
      const task = await databases.getDocument(DATABASE_ID, COLLECTIONS.TASKS, id);

      // Get comments
      const comments = await databases.listDocuments(DATABASE_ID, COLLECTIONS.COMMENTS, [
        Query.equal("taskId", id),
        Query.orderDesc("$createdAt"),
      ]);

      // Get attachments
      const attachments = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ATTACHMENTS, [
        Query.equal("taskId", id),
        Query.orderDesc("$createdAt"),
      ]);

      return c.json({
        success: true,
        data: { ...task, comments: comments.documents, attachments: attachments.documents },
      });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // POST /api/tasks
  .post("/", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const body = await c.req.json();
      const { databases } = createAdminClient();

      // Get max position for this project+status
      const existingTasks = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, [
        Query.equal("projectId", body.projectId),
        Query.equal("status", body.status || "todo"),
        Query.orderDesc("position"),
        Query.limit(1),
      ]);

      const maxPosition = existingTasks.documents.length > 0 ? existingTasks.documents[0].position + 1 : 0;

      // Fetch the parent project to inherently satisfy the legacy workspaceId requirement
      const project = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROJECTS, body.projectId);

      // SECURITY: Verify user is a member
      const membership = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, [
        Query.equal("workspaceId", project.workspaceId),
        Query.equal("userId", userId),
      ]);
      if (membership.documents.length === 0) {
        return c.json({ success: false, error: "Forbidden" }, 403);
      }

      const task = await databases.createDocument(DATABASE_ID, COLLECTIONS.TASKS, ID.unique(), {
        workspaceId: project.workspaceId,
        projectId: body.projectId,
        title: body.title,
        description: body.description || "",
        status: body.status || "todo",
        priority: body.priority || "medium",
        assigneeId: body.assigneeId || null,
        dueDate: body.dueDate || null,
        position: body.position ?? maxPosition,
        labels: body.labels || [],
      });

      return c.json({ success: true, data: task }, 201);
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // PATCH /api/tasks/:id
  .patch("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const { databases } = createAdminClient();

      const updateData: Record<string, any> = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.priority !== undefined) updateData.priority = body.priority;
      if (body.assigneeId !== undefined) updateData.assigneeId = body.assigneeId;
      if (body.dueDate !== undefined) updateData.dueDate = body.dueDate;
      if (body.position !== undefined) updateData.position = body.position;
      if (body.labels !== undefined) updateData.labels = body.labels;

      const task = await databases.updateDocument(DATABASE_ID, COLLECTIONS.TASKS, id, updateData);

      return c.json({ success: true, data: task });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // DELETE /api/tasks/:id
  .delete("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const { databases } = createAdminClient();

      // Delete comments and attachments
      const comments = await databases.listDocuments(DATABASE_ID, COLLECTIONS.COMMENTS, [
        Query.equal("taskId", id),
      ]);
      for (const cm of comments.documents) {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.COMMENTS, cm.$id);
      }

      const attachments = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ATTACHMENTS, [
        Query.equal("taskId", id),
      ]);
      for (const att of attachments.documents) {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.ATTACHMENTS, att.$id);
      }

      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TASKS, id);
      return c.json({ success: true });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // POST /api/tasks/:id/comments
  .post("/:id/comments", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const taskId = c.req.param("id");
      const body = await c.req.json();
      const { databases } = createAdminClient();

      const comment = await databases.createDocument(DATABASE_ID, COLLECTIONS.COMMENTS, ID.unique(), {
        taskId,
        userId,
        content: body.content,
      });

      return c.json({ success: true, data: comment }, 201);
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  });
