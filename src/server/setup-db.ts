// Appwrite Database Setup Script
// Run with: npx tsx src/server/setup-db.ts

import { Client, Databases, ID, Storage, IndexType } from "node-appwrite";
import { DATABASE_ID, COLLECTIONS, STORAGE_BUCKETS } from "../lib/constants";

// Load env from .env.local
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || "");

const databases = new Databases(client);
const storage = new Storage(client);

async function setup() {
  console.log("🚀 Setting up Work-flow database...\n");

  // Using existing database (Starter Plan bypass)
  console.log("⏭️  Using existing database: " + DATABASE_ID);

  // ---------- Workspaces ----------
  await createCollection(COLLECTIONS.WORKSPACES, "Workspaces", [
    { key: "name", type: "string", size: 256, required: true },
    { key: "ownerId", type: "string", size: 64, required: true },
    { key: "logoFileId", type: "string", size: 64, required: false },
  ]);

  // ---------- Workspace Members ----------
  await createCollection(COLLECTIONS.WORKSPACE_MEMBERS, "Workspace Members", [
    { key: "workspaceId", type: "string", size: 64, required: true },
    { key: "userId", type: "string", size: 64, required: true },
    { key: "role", type: "string", size: 16, required: true },
    { key: "joinedAt", type: "string", size: 64, required: false },
  ]);

  // ---------- Projects ----------
  await createCollection(COLLECTIONS.PROJECTS, "Projects", [
    { key: "workspaceId", type: "string", size: 64, required: true },
    { key: "name", type: "string", size: 256, required: true },
    { key: "description", type: "string", size: 2048, required: false },
    { key: "type", type: "string", size: 16, required: true },
    { key: "emoji", type: "string", size: 8, required: false },
  ]);

  // ---------- Tasks ----------
  await createCollection(COLLECTIONS.TASKS, "Tasks", [
    { key: "projectId", type: "string", size: 64, required: true },
    { key: "title", type: "string", size: 512, required: true },
    { key: "description", type: "string", size: 4096, required: false },
    { key: "status", type: "string", size: 32, required: true },
    { key: "priority", type: "string", size: 16, required: true },
    { key: "assigneeId", type: "string", size: 64, required: false },
    { key: "dueDate", type: "string", size: 64, required: false },
    { key: "position", type: "integer", required: true },
    { key: "labels", type: "string[]", size: 128, required: false },
  ]);

  // ---------- Comments ----------
  await createCollection(COLLECTIONS.COMMENTS, "Comments", [
    { key: "taskId", type: "string", size: 64, required: true },
    { key: "userId", type: "string", size: 64, required: true },
    { key: "content", type: "string", size: 4096, required: true },
  ]);

  // ---------- Attachments ----------
  await createCollection(COLLECTIONS.ATTACHMENTS, "Attachments", [
    { key: "taskId", type: "string", size: 64, required: true },
    { key: "fileId", type: "string", size: 64, required: true },
    { key: "fileName", type: "string", size: 256, required: true },
    { key: "fileSize", type: "integer", required: true },
    { key: "mimeType", type: "string", size: 128, required: false },
  ]);

  // ---------- Invites ----------
  await createCollection(COLLECTIONS.INVITES, "Invites", [
    { key: "workspaceId", type: "string", size: 64, required: true },
    { key: "email", type: "string", size: 320, required: true },
    { key: "role", type: "string", size: 16, required: true },
    { key: "code", type: "string", size: 32, required: true },
    { key: "status", type: "string", size: 16, required: true },
  ]);

  // ---------- Storage Buckets ----------
  try {
    await storage.createBucket(STORAGE_BUCKETS.AVATARS, "Avatars", undefined, true, true, 5 * 1024 * 1024);
    console.log("✅ Created bucket: " + STORAGE_BUCKETS.AVATARS);
  } catch (e: any) {
    if (e?.code === 409) console.log("⏭️  Bucket 'avatars' already exists");
    else if (e?.code === 403) console.log("⏭️  Skipping 'avatars' bucket due to Plan limits (please create manually).");
    else throw e;
  }

  try {
    await storage.createBucket(STORAGE_BUCKETS.ATTACHMENTS, "Attachments", undefined, true, true, 50 * 1024 * 1024);
    console.log("✅ Created bucket: " + STORAGE_BUCKETS.ATTACHMENTS);
  } catch (e: any) {
    if (e?.code === 409) console.log("⏭️  Bucket 'attachments' already exists");
    else if (e?.code === 403) console.log("⏭️  Skipping 'attachments' bucket due to Plan limits (please create manually).");
    else throw e;
  }

  console.log("\n🎉 Setup complete!");
}

interface AttrDef {
  key: string;
  type: string;
  size?: number;
  required: boolean;
}

async function createCollection(id: string, name: string, attrs: AttrDef[]) {
  try {
    await databases.createCollection(DATABASE_ID, id, name);
    console.log(`✅ Created collection: ${name}`);
  } catch (e: any) {
    if (e?.code === 409) {
      console.log(`⏭️  Collection '${name}' already exists`);
    } else throw e;
  }

  for (const attr of attrs) {
    try {
      if (attr.type === "string") {
        await databases.createStringAttribute(DATABASE_ID, id, attr.key, attr.size || 256, attr.required);
      } else if (attr.type === "string[]") {
        await databases.createStringAttribute(DATABASE_ID, id, attr.key, attr.size || 128, attr.required, undefined, true);
      } else if (attr.type === "integer") {
        await databases.createIntegerAttribute(DATABASE_ID, id, attr.key, attr.required);
      }
      console.log(`  + ${attr.key} (${attr.type})`);
    } catch (e: any) {
      if (e?.code === 409) {
        console.log(`  ⏭️  ${attr.key} already exists`);
      } else {
        console.error(`  ❌ ${attr.key}: ${e?.message}`);
      }
    }
  }

  // Create indexes
  try {
    if (id === COLLECTIONS.WORKSPACE_MEMBERS) {
      await databases.createIndex(DATABASE_ID, id, "idx_userId", IndexType.Key, ["userId"]);
      await databases.createIndex(DATABASE_ID, id, "idx_workspaceId", IndexType.Key, ["workspaceId"]);
    }
    if (id === COLLECTIONS.TASKS) {
      await databases.createIndex(DATABASE_ID, id, "idx_projectId", IndexType.Key, ["projectId"]);
      await databases.createIndex(DATABASE_ID, id, "idx_status", IndexType.Key, ["status"]);
      await databases.createIndex(DATABASE_ID, id, "idx_title", IndexType.Fulltext, ["title"]);
    }
    if (id === COLLECTIONS.PROJECTS) {
      await databases.createIndex(DATABASE_ID, id, "idx_workspaceId", IndexType.Key, ["workspaceId"]);
    }
    if (id === COLLECTIONS.COMMENTS) {
      await databases.createIndex(DATABASE_ID, id, "idx_taskId", IndexType.Key, ["taskId"]);
    }
    if (id === COLLECTIONS.INVITES) {
      await databases.createIndex(DATABASE_ID, id, "idx_code", IndexType.Key, ["code"]);
      await databases.createIndex(DATABASE_ID, id, "idx_workspaceId", IndexType.Key, ["workspaceId"]);
    }
  } catch (e: any) {
    if (e?.code !== 409) console.error(`  Index error: ${e?.message}`);
  }
}

setup().catch(console.error);
