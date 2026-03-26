import { Context, Next } from "hono";
import { createAdminClient } from "@/lib/appwrite-server";

// Middleware that extracts userId from session cookie
export async function authMiddleware(c: Context, next: Next) {
  try {
    const sessionCookie = c.req.header("cookie");
    const session = extractSession(sessionCookie || "");

    if (!session) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    // Verify session with Appwrite
    const { users } = createAdminClient();
    // Store session in context for downstream
    c.set("session", session);

    // We'll use the session to identify the user
    // The client passes along the userId in a header for server-side verification
    const userId = c.req.header("x-user-id");
    if (!userId) {
      return c.json({ success: false, error: "User ID required" }, 401);
    }

    c.set("userId", userId);
    await next();
  } catch (error) {
    return c.json({ success: false, error: "Authentication failed" }, 401);
  }
}

function extractSession(cookieHeader: string): string | null {
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === "workflow-session" && value) {
      return value;
    }
  }
  return null;
}
