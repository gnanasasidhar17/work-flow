# Work-flow - Jira-like Project Management Platform
## Complete Setup & Deployment Guide

---

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Prerequisites](#prerequisites)
4. [Local Development Setup](#local-development-setup)
5. [Feature Checklist](#feature-checklist)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Minimum Steps (3-5 minutes)

```bash
# 1. Clone/enter project
cd Work-flow

# 2. Install dependencies
npm install

# 3. Create Appwrite project at https://cloud.appwrite.io
# Get: Project ID and API Key

# 4. Create .env.local file
cat > .env.local << 'EOF'
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here
EOF

# 5. Setup database collections
npm run setup-db

# 6. Start development
npm run dev
```

Visit: **http://localhost:3000**

---

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **UI Framework**: shadcn/ui + TailwindCSS (Creme theme)
- **Backend**: Hono.js (RESTful API)
- **Database**: Appwrite (BaaS)
- **State Management**: Zustand + React Query
- **Drag & Drop**: dnd-kit
- **Components**: DnD and drag-and-drop enabled

### Folder Structure
```
src/
├── app/              # Next.js pages and layouts
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
├── server/          # Hono.js API routes
├── stores/          # Zustand stores
├── types/           # TypeScript definitions
├── lib/             # Utilities and configs
└── styles/          # Global styles
```

---

## 📋 Prerequisites

### Required
- **Node.js** 18+ (Download from https://nodejs.org)
- **npm** 9+ or **yarn** 3+
- **Appwrite Cloud Account** (Free tier: https://cloud.appwrite.io)

### Optional
- Docker (for self-hosted Appwrite)
- Vercel account (for deployment)

---

## 🔧 Local Development Setup

### 1. Install Dependencies
```bash
cd Work-flow
npm install
```

### 2. Appwrite Cloud Setup

#### Create a Free Project:
1. Go to https://cloud.appwrite.io
2. Sign up or login
3. Click **Create Project**
4. Enter project name (e.g., "Work-flow")
5. Copy your **Project ID**

#### Create API Key:
1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it "Development Key"
4. Select all permissions
5. Copy the key (32+ characters)

#### Create Buckets (Optional, for file uploads):
1. Go to **Storage** in your project
2. Create two buckets:
   - **avatars** - for user profile pictures
   - **attachments** - for task attachments

### 3. Environment Variables

Create `.env.local` in project root:

```bash
# Required
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here

# Optional (for storage)
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_AVATARS=avatars
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ATTACHMENTS=attachments
NEXT_PUBLIC_APP_NAME=Work-flow
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Schema Setup

Run the automated setup script:

```bash
npm run setup-db
```

This creates 7 collections automatically:
- **workspaces** - Team workspaces
- **workspace_members** - Team members with roles
- **projects** - Projects within workspaces
- **tasks** - Tasks/issues
- **comments** - Task comments
- **attachments** - File attachments
- **invites** - Workspace invitations

### 5. Start Development Server

```bash
npm run dev
```

Server runs on: **http://localhost:3000**

---

## ✅ Feature Checklist

### ✨ Implemented Features

#### 1. ✅ User Management
- [x] Email/Password signup & login
- [x] Google OAuth support
- [x] User sessions with Appwrite Auth
- [x] Logout functionality

#### 2. ✅ Workspaces
- [x] Create workspace
- [x] Switch between workspaces
- [x] Edit workspace name & logo
- [x] Delete workspace (owner only)
- [x] View workspace members

#### 3. ✅ Projects
- [x] Create projects in workspaces
- [x] Edit project details (name, type, emoji)
- [x] Support Kanban & Scrum types
- [x] Delete projects
- [x] Project emoji selection

#### 4. ✅ Tasks (Issues)
- [x] Create tasks with full details
- [x] Assign users to tasks
- [x] Set priority (Low, Medium, High, Urgent)
- [x] Set status (To Do, In Progress, In Review, Done)
- [x] Add descriptions
- [x] Set due dates
- [x] View task details
- [x] Edit/update tasks
- [x] Delete tasks

#### 5. ✅ Kanban Board View
- [x] Drag & drop tasks between columns
- [x] 4 columns: To Do, In Progress, In Review, Done
- [x] Real-time status updates
- [x] Visual status indicators
- [x] Smooth animations
- [x] Mobile responsive

#### 6. ✅ Data Table View
- [x] Spreadsheet-style view
- [x] Sort by: title, status, priority, due date
- [x] Filter by status and priority
- [x] Search tasks
- [x] Inline task editing
- [x] Responsive columns

#### 7. ✅ Calendar View
- [x] Monthly calendar view
- [x] Show tasks by due date
- [x] Click to create task on date
- [x] Today indicator
- [x] Month navigation

#### 8. ✅ Team & Permissions
- [x] Invite users via email
- [x] Role-based access (Owner, Admin, Member)
- [x] Accept invite links
- [x] Manage workspace members
- [x] Permission enforcement

#### 9. ✅ Comments & Collaboration
- [x] Add comments to tasks
- [x] View comments
- [x] Comment history

#### 10. ✅ File Management
- [x] File upload structure in Appwrite
- [x] Avatar uploads
- [x] Task attachment uploads ready

#### 11. ✅ Search & Filtering
- [x] Global search bar
- [x] Task search by title
- [x] Filter by status
- [x] Filter by priority
- [x] Filter by assignee

#### 12. ✅ UI/UX
- [x] Creme/soft beige color palette
- [x] Minimal modern design (Notion + Jira hybrid)
- [x] Rounded shadcn/ui components
- [x] Responsive design (mobile + desktop)
- [x] Dark mode ready
- [x] Loading states
- [x] Toast notifications
- [x] Smooth animations

#### 13. ✅ Backend API
- [x] RESTful API with Hono.js
- [x] JWT authentication
- [x] Middleware for auth validation
- [x] Error handling
- [x] Request validation with Zod

#### 14. ✅ State Management & Data
- [x] Zustand for global state
- [x] React Query for server state
- [x] Real database persistence (Appwrite)
- [x] Optimistic UI updates
- [x] Cache management

---

## 🗄️ Database Schema

### Collections & Attributes

#### **workspaces**
```
- $id: string (auto)
- $createdAt: datetime (auto)
- name: string (required)
- ownerId: string (required)
- logoFileId: string (optional)
```

#### **workspace_members**
```
- $id: string (auto)
- workspaceId: string (required)
- userId: string (required)
- role: enum [owner, admin, member] (required)
- joinedAt: datetime (required)
```

#### **projects**
```
- $id: string (auto)
- $createdAt: datetime (auto)
- workspaceId: string (required)
- name: string (required)
- description: string (optional)
- type: enum [kanban, scrum] (required)
- emoji: string (optional)
```

#### **tasks**
```
- $id: string (auto)
- $createdAt: datetime (auto)
- projectId: string (required)
- title: string (required)
- description: string (optional)
- status: enum [todo, in-progress, in-review, done] (required)
- priority: enum [low, medium, high, urgent] (required)
- assigneeId: string (optional)
- dueDate: datetime (optional)
- position: integer (required)
- labels: string (optional)
```

#### **comments**
```
- $id: string (auto)
- $createdAt: datetime (auto)
- taskId: string (required)
- userId: string (required)
- content: string (required)
```

#### **attachments**
```
- $id: string (auto)
- $createdAt: datetime (auto)
- taskId: string (required)
- fileId: string (required)
- fileName: string (required)
- fileUrl: string (required)
- uploadedBy: string (required)
```

#### **invites**
```
- $id: string (auto)
- $createdAt: datetime (auto)
- workspaceId: string (required)
- email: string (required)
- role: enum [owner, admin, member] (required)
- code: string (required, 12 chars)
- status: enum [pending, accepted, declined] (required)
```

---

## 🔌 API Endpoints

### Base URL: `/api`

#### **Auth** (`/auth`)
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Email/password login
- `GET /auth/me` - Get current user
- `DELETE /auth/logout` - Logout

#### **Workspaces** (`/workspaces`)
- `GET /workspaces` - List user's workspaces
- `POST /workspaces` - Create workspace
- `PATCH /workspaces/:id` - Update workspace
- `DELETE /workspaces/:id` - Delete workspace
- `GET /workspaces/:id/members` - List members

#### **Projects** (`/projects`)
- `GET /projects?workspaceId=xxx` - List workspace projects
- `GET /projects/:id` - Get project details
- `POST /projects` - Create project
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

#### **Tasks** (`/tasks`)
- `GET /tasks` - List tasks (with filters)
- `GET /tasks/:id` - Get task details
- `GET /tasks/workspace/:workspaceId` - Get all workspace tasks
- `POST /tasks` - Create task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/comments` - Add comment

#### **Invites** (`/invites`)
- `POST /invites` - Send invite
- `POST /invites/:code/accept` - Accept invite
- `GET /invites?workspaceId=xxx` - List invites

---

## 🚀 Production Deployment

### Deploy to Vercel (Recommended)

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel
# Go to https://vercel.com/new
# Select your GitHub repo

# 3. Add environment variables in Vercel dashboard:
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key

# 4. Deploy
# Vercel will automatically deploy on push
```

### Deploy to Docker (Self-hosted)

```dockerfile
# Create Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
```

Build & deploy:
```bash
docker build -t workflow .
docker run -e NEXT_PUBLIC_APPWRITE_PROJECT_ID=xxx -p 3000:3000 workflow
```

### Environment for Production

```bash
# .env.production
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key (keep secret!)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 🔍 Troubleshooting

### Issue: "Project not found" error
**Solution:**
- Verify `NEXT_PUBLIC_APPWRITE_PROJECT_ID` is correct
- Check it matches your Appwrite project ID
- Restart development server

### Issue: "API Key invalid"
**Solution:**
- Check `APPWRITE_API_KEY` is correct
- Regenerate key in Appwrite if needed
- Ensure all permissions are enabled

### Issue: Collections not syncing
**Solution:**
```bash
# Re-run setup
npm run setup-db

# Or manually create collections in Appwrite Admin Console
# See Database Schema section
```

### Issue: Auth not working
**Solution:**
- Clear browser cookies
- Clear `.next` cache: `rm -rf .next`
- Restart: `npm run dev`
- Check browser console for errors

### Issue: Drag-and-drop not working
**Solution:**
- Clear browser cache
- Check for JavaScript errors in console
- Ensure dnd-kit packages are installed

### Issue: Images/avatars not uploading
**Solution:**
- Create storage buckets in Appwrite
- See Appwrite Cloud Setup section
- Check file upload permissions

---

## 📚 Component Documentation

### Key Components

#### **KanbanBoard** (`@/components/kanban/kanban-board.tsx`)
Manages drag-and-drop with dnd-kit
- Props: tasks, onStatusChange, onEditTask, onCreateTask, members
- Features: DnD, sorting, visual feedback

#### **DataTableView** (`@/components/data-table/data-table-view.tsx`)
Spreadsheet-style task view
- Features: Sorting, filtering, search, inline editing

#### **CalendarView** (`@/components/calendar/calendar-view.tsx`)
Monthly calendar with tasks
- Features: Month navigation, task by date, click to create

#### **TaskDialog** (`@/components/tasks/task-dialog.tsx`)
Modal for creating/editing tasks
- Features: All task fields, date picker, assignee select

---

## 🎨 Customization

### Change Color Theme
Edit `src/app/globals.css`:
```css
:root {
  --primary: 30 35% 56%;  /* Change primary color */
  --secondary: 35 25% 93%;  /* Change secondary */
  /* ... more colors */
}
```

### Add New Task Status
Edit `src/lib/constants.ts`:
```typescript
export const TASK_STATUSES = [
  // ... existing
  {
    value: "custom",
    label: "Custom Status",
    color: "#FF0000",
    bgColor: "bg-red-50 text-red-700",
  }
];
```

### Modify API Behavior
Edit `src/server/routes/*.ts` files

---

## 📞 Support & Resources

- **Appwrite Docs**: https://appwrite.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **React Query**: https://tanstack.com/query/latest
- **Zustand**: https://github.com/pmndrs/zustand
- **dnd-kit**: https://docs.dndkit.com

---

## 📝 License

This project is provided as-is for educational and commercial use.

---

**Happy coding! 🚀**
