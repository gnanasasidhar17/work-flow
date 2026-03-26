import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { authRoutes } from "@/server/routes/auth";
import { workspaceRoutes } from "@/server/routes/workspaces";
import { projectRoutes } from "@/server/routes/projects";
import { taskRoutes } from "@/server/routes/tasks";
import { inviteRoutes } from "@/server/routes/invites";
import { createAdminClient } from "@/lib/appwrite-server";
import { DATABASE_ID } from "@/lib/constants";

const app = new Hono().basePath("/api");

app.use("/*", cors());

// Health check
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Debug endpoint - check all tables exist
app.get("/debug/tables", async (c) => {
  try {
    const { databases } = createAdminClient();
    
    const collections = await databases.listCollections(DATABASE_ID);
    return c.json({
      tableCount: collections.total,
      tables: collections.collections.map((t: { $id: string; name: string }) => ({ id: t.$id, name: t.name })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Error";
    return c.json({ error: message }, 500);
  }
});

// Mount routes
app.route("/auth", authRoutes);
app.route("/workspaces", workspaceRoutes);
app.route("/projects", projectRoutes);
app.route("/tasks", taskRoutes);
app.route("/invites", inviteRoutes);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
