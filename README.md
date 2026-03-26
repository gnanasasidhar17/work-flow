# Work-flow 🚀
**A Full-Stack Jira-like Project Management Platform**

Build with modern technologies, designed with a beautiful creme/soft beige aesthetic, and fully functional from day one.

---

## ✨ Features

### 🏢 Workspaces
- ✅ Multi-tenant workspace management
- ✅ Team member invitations
- ✅ Role-based access (Owner, Admin, Member)
- ✅ Workspace switching & customization

### 📊 Projects
- ✅ Create projects with Kanban or Scrum board
- ✅ Project customization (name, description, emoji)
- ✅ Multiple views (Board, Table, Calendar)
- ✅ Project deletion with cascade

### ✅ Tasks Management
- ✅ Full task CRUD operations
- ✅ Priority levels (Low, Medium, High, Urgent)
- ✅ Status tracking (To Do, In Progress, In Review, Done)
- ✅ Due date management
- ✅ Task assignments
- ✅ Task descriptions

### 🎯 Kanban Board
- ✅ **Drag & Drop** between columns using dnd-kit
- ✅ Real-time status synchronization
- ✅ Smooth animations
- ✅ Mobile responsive
- ✅ Visual priority indicators

### 📋 Data Table View
- ✅ Spreadsheet-style interface
- ✅ Sortable columns
- ✅ Advanced filtering
- ✅ Global search
- ✅ Inline editing

### 📅 Calendar View
- ✅ Monthly calendar
- ✅ Tasks by due date
- ✅ Click to create tasks
- ✅ Month navigation

### 👥 Team & Collaboration
- ✅ Invite users via email
- ✅ Real-time member management
- ✅ Permission enforcement
- ✅ Comments on tasks
- ✅ Activity tracking

### 🎨 Design & UX
- ✅ Creme/soft beige color palette
- ✅ Minimal, modern design (Notion + Jira hybrid)
- ✅ Fully responsive (desktop & mobile)
- ✅ Smooth interactions
- ✅ Loading states
- ✅ Toast notifications

### 🔐 Security & Auth
- ✅ Email/Password authentication
- ✅ Google OAuth support
- ✅ JWT-based sessions
- ✅ Role-based permissions
- ✅ Secure API endpoints

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State**: Zustand + React Query
- **Drag & Drop**: dnd-kit
- **Charts**: Recharts

### Backend
- **API**: Hono.js (lightweight, type-safe)
- **Database**: Appwrite (BaaS with Auth, Storage, Database)
- **Validation**: Zod
- **Authentication**: Appwrite Auth

### DevOps
- **Deployment**: Vercel (recommended) or Docker
- **Package Manager**: npm/yarn
- **Node Version**: 18+

---

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites
- [Node.js 18+](https://nodejs.org)
- [Appwrite Cloud Account](https://cloud.appwrite.io) (free)

### 2. Setup

```bash
# Clone repository
git clone <your-repo>
cd Work-flow

# Install dependencies
npm install

# Create environment file
cat > .env.local << 'EOF'
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here
EOF

# Setup database (creates collections automatically)
npm run setup-db

# Start development server
npm run dev
```

Visit: **http://localhost:3000**

### 3. First Steps
1. Sign up with email & password
2. Create a workspace
3. Add a project
4. Create and manage tasks
5. Try drag-and-drop on the Kanban board!

---

## 📚 Complete Documentation

### Getting Started
- 🚀 **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Detailed setup & deployment
- 🔧 **[APPWRITE_SETUP.md](./APPWRITE_SETUP.md)** - Appwrite configuration
- 📋 **[.env.example](./.env.example)** - Environment variables

### Development
- **API Endpoints**: See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md#-api-endpoints)
- **Database Schema**: See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md#-database-schema)
- **Component Guide**: See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md#-component-documentation)

### Deployment
- **Vercel**: See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md#deploy-to-vercel-recommended)
- **Docker**: See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md#deploy-to-docker-self-hosted)

---

## 📁 Project Structure

```
Work-flow/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── (auth)/            # Login/Signup
│   │   ├── (dashboard)/       # Dashboard layout
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── kanban/           # Kanban board
│   │   ├── calendar/         # Calendar view
│   │   ├── data-table/       # Table view
│   │   ├── tasks/            # Task dialogs
│   │   ├── layout/           # Layout components
│   │   └── ui/               # shadcn/ui
│   ├── hooks/                 # Custom hooks
│   ├── server/                # Backend logic
│   ├── stores/                # State management
│   ├── types/                 # TypeScript types
│   └── lib/                   # Utilities
├── scripts/
│   └── setup-appwrite.ts     # Setup script
├── package.json
└── COMPLETE_SETUP_GUIDE.md
```

---

## 🎯 Key Features Breakdown

### Drag & Drop Kanban
- **4 Columns**: To Do, In Progress, In Review, Done
- **Smooth DnD**: Using dnd-kit library
- **Instant Updates**: Changes save immediately
- **Responsive**: Works on mobile too

### Multi-View
- **Board View** (Kanban) - Best for visual workflow
- **Table View** - Best for bulk editing & searching
- **Calendar View** - Best for deadline management

### Real-time Collaboration
- Instant member notifications
- Live task updates
- Comment threads
- Activity logs (ready to implement)

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
git push origin main
# Go to vercel.com/new, connect repo, add env vars, deploy!
```

### Docker
```bash
docker build -t workflow .
docker run -p 3000:3000 -e APPWRITE_API_KEY=xxx workflow
```

---

## 🐛 Troubleshooting

See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md#-troubleshooting) for solutions.

---

## 📊 Project Statistics

- **Frontend Pages**: 8+
- **API Endpoints**: 20+
- **Database Collections**: 7
- **Components**: 30+
- **Lines of Code**: 4000+

---

## 📝 License

MIT License - feel free to use and modify!

---

**Start building amazing projects with Work-flow today! 🚀**

For detailed documentation, see [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
