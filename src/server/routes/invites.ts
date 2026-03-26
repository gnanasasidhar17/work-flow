import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite-server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/constants";

export const inviteRoutes = new Hono()

  // POST /api/invites - Create invite
  .post("/", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const body = await c.req.json();
      const { databases } = createAdminClient();

      // Verify user is owner/admin of workspace
      const members = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, [
        Query.equal("workspaceId", body.workspaceId),
        Query.equal("userId", userId),
      ]);

      if (members.documents.length === 0 || !["owner", "admin"].includes(members.documents[0].role)) {
        return c.json({ success: false, error: "Insufficient permissions" }, 403);
      }

      // Check if already a member
      const existingMembers = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, [
        Query.equal("workspaceId", body.workspaceId),
      ]);

      // Check if invite already exists
      const existingInvites = await databases.listDocuments(DATABASE_ID, COLLECTIONS.INVITES, [
        Query.equal("workspaceId", body.workspaceId),
        Query.equal("email", body.email),
        Query.equal("status", "pending"),
      ]);

      if (existingInvites.documents.length > 0) {
        return c.json({ success: false, error: "Invite already sent" }, 400);
      }

      const code = generateInviteCode();
      const invite = await databases.createDocument(DATABASE_ID, COLLECTIONS.INVITES, ID.unique(), {
        workspaceId: body.workspaceId,
        email: body.email,
        role: body.role || "member",
        code,
        status: "pending",
      });

      return c.json({ success: true, data: invite }, 201);
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // POST /api/invites/:code/accept - Accept invite
  .post("/:code/accept", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const code = c.req.param("code");
      const { databases } = createAdminClient();

      const invites = await databases.listDocuments(DATABASE_ID, COLLECTIONS.INVITES, [
        Query.equal("code", code),
        Query.equal("status", "pending"),
      ]);

      if (invites.documents.length === 0) {
        return c.json({ success: false, error: "Invalid or expired invite" }, 404);
      }

      const invite = invites.documents[0];

      // Check if already a member
      const existingMember = await databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, [
        Query.equal("workspaceId", invite.workspaceId),
        Query.equal("userId", userId),
      ]);

      if (existingMember.documents.length > 0) {
        return c.json({ success: false, error: "Already a member" }, 400);
      }

      // Add as member
      await databases.createDocument(DATABASE_ID, COLLECTIONS.WORKSPACE_MEMBERS, ID.unique(), {
        workspaceId: invite.workspaceId,
        userId,
        role: invite.role,
        joinedAt: new Date().toISOString(),
      });

      // Mark invite as accepted
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.INVITES, invite.$id, {
        status: "accepted",
      });

      return c.json({ success: true, message: "Invite accepted" });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // POST /api/invites/:code/decline - Decline invite
  .post("/:code/decline", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const code = c.req.param("code");
      const { databases } = createAdminClient();

      const invites = await databases.listDocuments(DATABASE_ID, COLLECTIONS.INVITES, [
        Query.equal("code", code),
        Query.equal("status", "pending"),
      ]);

      if (invites.documents.length === 0) {
        return c.json({ success: false, error: "Invalid or expired invite" }, 404);
      }

      const invite = invites.documents[0];

      // Mark invite as declined
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.INVITES, invite.$id, {
        status: "declined",
      });

      return c.json({ success: true, message: "Invite declined" });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // GET /api/invites/me - Get current user's pending invites
  .get("/me", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) return c.json({ success: false, error: "Unauthorized" }, 401);

      const { users, databases } = createAdminClient();
      const user = await users.get(userId);
      const email = user.email;

      const invites = await databases.listDocuments(DATABASE_ID, COLLECTIONS.INVITES, [
        Query.equal("email", email),
        Query.equal("status", "pending"),
        Query.orderDesc("$createdAt"),
      ]);

      // Enrich with workspace names
      const enrichedInvites = await Promise.all(
        invites.documents.map(async (inv) => {
          try {
            const ws = await databases.getDocument(DATABASE_ID, COLLECTIONS.WORKSPACES, inv.workspaceId);
            return { ...inv, workspaceName: ws.name };
          } catch {
            return { ...inv, workspaceName: "Unknown Workspace" };
          }
        })
      );

      return c.json({ success: true, data: enrichedInvites });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  })

  // GET /api/invites?workspaceId=xxx
  .get("/", async (c) => {
    try {
      const workspaceId = c.req.query("workspaceId");
      if (!workspaceId) return c.json({ success: false, error: "workspaceId required" }, 400);

      const { databases } = createAdminClient();
      const invites = await databases.listDocuments(DATABASE_ID, COLLECTIONS.INVITES, [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
      ]);

      return c.json({ success: true, data: invites.documents, total: invites.total });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message }, 500);
    }
  });

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
