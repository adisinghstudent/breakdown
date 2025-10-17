# Breakdown - AI-Powered Project Setup System

## What We Built

A Next.js application that allows users to define projects through a structured form, get AI-powered clarifying questions, and automatically set up the entire project infrastructure including:

- **Project Definition Form**: Comprehensive form capturing all 9 key project attributes
- **Clarifying Questions Flow**: AI-generated follow-up questions for better project understanding
- **Database Integration**: Prisma + SQLite for storing projects, employees, and tasks
- **Base44-Style UI**: Clean, modern interface with gradient backgrounds and smooth transitions

## Key Features

### 1. Project Definition (9 Fields)

1. **Project Title/Objective** - Clear project name
2. **Detailed Description** - Full context for AI processing
3. **Goals/Deliverables** - Measurable outcomes
4. **Timeline** - Deadline and flexibility preferences
5. **Effort Level** - Team size and duration estimates
6. **Required Skills** - Multi-select skill tags (Frontend, Backend, ML, etc.)
7. **Priority** - Low/Medium/High urgency
8. **Dependencies** - Related systems or projects
9. **Budget** - Hours and/or monetary budget

### 2. Clarifying Questions Modal

- Multi-step wizard UI
- Progress indicator
- Support for text, single-choice, and multi-choice questions
- Dynamic question generation based on project data

### 3. Database Schema

```prisma
- Project (title, description, goals, skills, budget, etc.)
- Employee (name, email, skills, workload, availability)
- Task (title, description, assignedTo, estimatedHours, status)
- ProjectAssignment (many-to-many: projects ↔ employees)
```

### 4. Landing Page

- Base44-inspired design
- Two primary CTAs: "Start Building" and "Chat with AI"
- Template suggestions (Reporting Dashboard, Gaming Platform, etc.)

## File Structure

```
/app
  /api
    /projects
      /create         # Initial project submission
      /finalize       # Save project after clarifying questions
  /create-project     # Project definition form page
  /chat               # ChatKit interface page
  page.tsx            # Landing page

/components
  ProjectDefinitionForm.tsx     # Main form with all 9 fields
  ClarifyingQuestionsModal.tsx  # Multi-step question wizard
  ChatKitPanel.tsx              # Existing chat interface
  ErrorOverlay.tsx              # Error handling UI

/lib
  types.ts          # TypeScript interfaces
  prisma.ts         # Prisma client singleton
  config.ts         # App configuration
  redpanda.ts       # Kafka/Redpanda producer

/prisma
  schema.prisma     # Database schema
  dev.db            # SQLite database file
```

## Next Steps for Full Implementation

### 1. GitHub Integration
```typescript
// lib/github.ts
export async function createRepository(projectName: string) {
  // Use Octokit to create repo
}

export async function createIssues(repoName: string, tasks: Task[]) {
  // Create GitHub issues for each task
}
```

### 2. AI Task Breakdown
```typescript
// lib/ai-orchestration.ts
export async function generateTaskBreakdown(project: ProjectDefinition) {
  // Call ChatKit workflow to decompose project into tasks
  // Assign tasks based on employee skills/availability
}
```

### 3. Codex Node System
```typescript
// lib/codex-node.ts
export async function spawnCodexNode(task: Task) {
  // Create ChatKit session for this specific task
  // Agent works on task autonomously
  // Monitor progress via telemetry
  // Create PR when complete
}
```

### 4. Employee Management
- Add `/employees` page to view/manage team
- Import employee data from external systems
- Track workload and availability in real-time

### 5. Project Dashboard
- View all projects and their status
- Monitor active codex nodes
- Review and approve PRs
- Track progress against goals

## API Endpoints

### `POST /api/projects/create`
**Purpose**: Initial project submission
**Request**:
```json
{
  "title": "Customer Dashboard",
  "description": "...",
  "goals": ["..."],
  "effortLevel": "medium",
  "requiredSkills": ["frontend", "backend"],
  "priority": "high"
}
```
**Response**:
```json
{
  "projectId": "proj_123",
  "status": "needs_clarification",
  "clarifyingQuestions": [...]
}
```

### `POST /api/projects/finalize`
**Purpose**: Save project after clarifying questions
**Request**:
```json
{
  "projectId": "proj_123",
  "answers": { "question_0": "React", ... },
  "projectData": { ... }
}
```

## Environment Variables

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# OpenAI ChatKit
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_CHATKIT_WORKFLOW_ID="wf_..."
NEXT_PUBLIC_CLARIFICATION_WORKFLOW_ID="wf_..."  # For clarifying questions

# Redpanda/Kafka (Optional)
REDPANDA_BROKERS="broker1:9092,broker2:9092"
REDPANDA_SASL_USERNAME="username"
REDPANDA_SASL_PASSWORD="password"
REDPANDA_TELEMETRY_TOPIC="chatkit_telemetry"

# GitHub (TODO)
GITHUB_TOKEN="ghp_..."
GITHUB_ORG="your-org"
```

## Running the Application

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Access Points

- **Landing Page**: http://localhost:3000
- **Create Project**: http://localhost:3000/create-project
- **Chat Interface**: http://localhost:3000/chat

## Design Philosophy

The UI follows Base44's design principles:
- Clean gradients (sky-200 → orange-50 → orange-100)
- Orange accent color (#f97316) for primary actions
- Large, bold typography
- Ample whitespace
- Smooth transitions and hover states
- Mobile-responsive design

## Future Enhancements

1. **Real-time Progress Tracking**: WebSocket connections to monitor codex nodes
2. **AI-Powered Employee Matching**: ML model to optimize task assignments
3. **Cost Estimation**: Predict project costs based on historical data
4. **Sprint Planning**: Auto-generate sprint schedules from project timeline
5. **Code Review Automation**: AI reviews PRs before human approval
6. **Analytics Dashboard**: Visualize team productivity and project metrics

## Architecture Decisions

### Why SQLite?
- Fast prototyping
- Zero configuration
- Easy to migrate to PostgreSQL later

### Why Prisma?
- Type-safe database access
- Excellent DX with migrations
- Auto-generated TypeScript types

### Why ChatKit?
- Pre-built UI components
- Workflow orchestration
- Session management
- Tool calling support

## Contributing

To extend this system:

1. **Add new project fields**: Update `ProjectDefinition` in `lib/types.ts` and the form
2. **Customize clarifying questions**: Edit `generateClarifyingQuestions()` in `/api/projects/create`
3. **Integrate new AI workflows**: Create new ChatKit workflows and reference them in config
4. **Add database models**: Update `prisma/schema.prisma` and run `npx prisma generate`
