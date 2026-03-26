# APPWRITE_SETUP.md

Work-flow Project Management Platform - Appwrite Setup Guide

## Prerequisites

1. **Node.js** 18+ and npm
2. **Appwrite Cloud Account** (free tier available at https://cloud.appwrite.io)

## Quick Start

### 1. Create Appwrite Project

1. Go to [Appwrite Cloud](https://cloud.appwrite.io)
2. Create new project and note:
   - Project ID
   - API Endpoint (usually `https://cloud.appwrite.io/v1`)
   - Create API Key (Settings → API Keys)

### 2. Set Environment Variables

Create `.env.local` in project root:

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
```

### 3. Create Database

Run setup script:

```bash
npm install
npm run setup-db
```

Or manually create database `workflow_db` with these collections:

- **workspaces**: id, name, ownerId, logoFileId, createdAt
- **workspace_members**: id, workspaceId, userId, role, joinedAt
- **projects**: id, workspaceId, name, description, type, emoji, createdAt
- **tasks**: id, projectId, title, description, status, priority, assigneeId, dueDate, position, labels, createdAt
- **comments**: id, taskId, userId, content, createdAt
- **attachments**: id, taskId, fileId, fileName, fileUrl, uploadedBy, createdAt
- **invites**: id, workspaceId, email, role, code, status, createdAt

### 4. Start Development

```bash
npm run dev
```

Visit http://localhost:3000

## Troubleshooting

- **Collections not syncing**: Re-run `npm run setup-db`
- **Auth errors**: Check API key and project ID in `.env.local`
- **Storage issues**: Create buckets: `avatars`, `attachments` in Appwrite

For more help, see [Appwrite Docs](https://appwrite.io/docs)
