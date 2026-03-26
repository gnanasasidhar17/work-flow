import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite-server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/constants";

export const workspaceRoutes = new Hono()

  // GET /api/workspaces - List workspaces for current user
  .get("/", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const { databases } = createAdminClient();

      // Find all workspace memberships for this user
      const memberships = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, [
        Query.equal("userId", userId),
        Query.limit(100),
      ]);

      if (memberships.documents.length === 0) {
        return c.json({ success: true, data: [], total: 0 });
      }

      const workspaceIds = memberships.documents.map((m) => m.workspaceId);
      const workspaces = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACES, [
        Query.equal("$id", workspaceIds),
        Query.orderDesc("$createdAt"),
      ]);

      // Attach user's role to each workspace
      const data = workspaces.documents.map((ws) => {
        const membership = memberships.documents.find((m) => m.workspaceId === ws.$id);
        return { ...ws, role: membership?.role || "member" };
      });

      return c.json({ success: true, data, total: data.length });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // POST /api/workspaces - Create workspace
  .post("/", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const body = await c.req.json();
      const { databases } = createAdminClient();

      // Create workspace with legacy backwards-compatibility fields defined in existing DB
      const workspace = await databases.createDocument(DATABASE_ID, COLLECTIONS.WORKSPACES, ID.unique(), {
        name: body.name,
        ownerId: userId,
        userId: userId,
        inviteCode: Math.random().toString(36).substring(7),
        imageUrl: "",
        logoFileId: body.logoFileId || undefined,
      });

      // Add creator as owner member
      await databases.createDocument(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, ID.unique(), {
        workspaceId: workspace.$id,
        userId,
        role: "owner",
        joinedAt: new Date().toISOString(),
      });

      return c.json({ success: true, data: workspace }, 201);
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // PATCH /api/workspaces/:id - Update workspace
  .patch("/:id", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const id = c.req.param("id");
      const body = await c.req.json();
      const { databases } = createAdminClient();

      // Verify user is owner or admin
      const members = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, [
        Query.equal("workspaceId", id),
        Query.equal("userId", userId),
      ]);

      if (members.documents.length === 0 || !["owner", "admin"].includes(members.documents[0].role)) {
        return c.json({ success: false, error: "Insufficient permissions" }, 403);
      }

      const workspace = await databases.updateDocument(DATABASE_ID, COLLECTIONS.WORKSPACES, id, {
        ...(body.name && { name: body.name }),
        ...(body.logoFileId !== undefined && { logoFileId: body.logoFileId }),
      });

      return c.json({ success: true, data: workspace });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // DELETE /api/workspaces/:id - Delete workspace (owner only)
  .delete("/:id", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const id = c.req.param("id");
      const { databases } = createAdminClient();

      // Verify user is owner
      const workspace = await databases.getDocument(DATABASE_ID, COLLECTIONS.WORKSPACES, id);
      if (workspace.ownerId !== userId) {
        return c.json({ success: false, error: "Only workspace owner can delete" }, 403);
      }

      // Delete all related data
      const projects = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROJECTS, [
        Query.equal("workspaceId", id),
      ]);
      for (const p of projects.documents) {
        // Delete tasks for each project
        const tasks = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, [
          Query.equal("projectId", p.$id),
        ]);
        for (const t of tasks.documents) {
          await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TASKS, t.$id);
        }
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PROJECTS, p.$id);
      }

      // Delete members and invites
      const members = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, [
        Query.equal("workspaceId", id),
      ]);
      for (const m of members.documents) {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, m.$id);
      }

      const invites = await databases.listDocuments(DATABASE_ID, COLLECTIONS.INVITES, [
        Query.equal("workspaceId", id),
      ]);
      for (const inv of invites.documents) {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.INVITES, inv.$id);
      }

      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.WORKSPACES, id);

      return c.json({ success: true });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // GET /api/workspaces/:id/members - List workspace members
  .get("/:id/members", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const id = c.req.param("id");
      const { databases, users } = createAdminClient();

      const memberships = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, [
        Query.equal("workspaceId", id),
        Query.limit(100),
      ]);

      // Enrich with user info
      const data = await Promise.all(
        memberships.documents.map(async (m) => {
          try {
            const user = await users.get(m.userId);
            return {
              ...m,
              userName: user.name,
              userEmail: user.email,
            };
          } catch {
            return { ...m, userName: "Unknown", userEmail: "" };
          }
        })
      );

      return c.json({ success: true, data, total: data.length });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  });
