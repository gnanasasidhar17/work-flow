import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite-server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/constants";

export const authRoutes = new Hono()

  // POST /api/auth/signup
  .post(
    "/signup",
    zValidator(
      "json",
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8),
      })
    ),
    async (c) => {
      try {
        const { name, email, password } = c.req.valid("json");
        const { users } = createAdminClient();

        const user = await users.create(ID.unique(), email, undefined, password, name);

        return c.json({
          success: true,
          data: {
            $id: user.$id,
            name: user.name,
            email: user.email,
          },
        });
      } catch (error: any) {
        return c.json({ success: false, error: error?.message || "Signup failed" }, 400);
      }
    }
  )

  // POST /api/auth/login
  .post(
    "/login",
    zValidator(
      "json",
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    ),
    async (c) => {
      try {
        // Client-side will handle Appwrite session creation
        // This endpoint validates and returns user info
        return c.json({
          success: true,
          message: "Use client-side Appwrite SDK for session management",
        });
      } catch (error: any) {
        return c.json({ success: false, error: error?.message || "Login failed" }, 400);
      }
    }
  )

  // GET /api/auth/me
  .get("/me", async (c) => {
    try {
      const userId = c.req.header("x-user-id");
      if (!userId) {
        return c.json({ success: false, error: "Not authenticated" }, 401);
      }

      const { users } = createAdminClient();
      const user = await users.get(userId);

      return c.json({
        success: true,
        data: {
          $id: user.$id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: any) {
      return c.json({ success: false, error: error?.message || "Not authenticated" }, 401);
    }
  });
