# EduTex - Next Development Steps

This document outlines the prioritized roadmap for completing the EduTex instructional design workspace.

**Last Updated:** January 4, 2026

---

## 🎯 CURRENT PRIORITY: TipTap Storyboard Editor

### ✅ Milestone 1: TipTap Foundation - COMPLETE

Replaced frame-based storyboard with TipTap rich text editor. See CHANGELOG.md v0.5.0 for details.

### Milestone 2: Custom Block Nodes (NEXT)

**Goal:** Add storyboard-specific blocks for eLearning course design.

#### New BlockType Values (Prisma Schema)
```prisma
enum BlockType {
  // ... existing types ...
  STORYBOARD_METADATA       // Course title, audience, duration
  ELEARNING_SCREEN          // Two-column visual/script
  LEARNING_OBJECTIVES_IMPORT // Import from project objectives
  CHECKLIST                 // Task/Responsible/Due table
  TABLE                     // Generic configurable table
  FACILITATOR_NOTES         // ILT/vILT delivery notes
  MATERIALS_LIST            // Equipment/supplies for ILT
}
```

#### Tasks
1. **Schema Update**
   - Add new BlockType values to `prisma/schema.prisma`
   - Run `npx prisma migrate dev`
   - Update VALID_BLOCK_TYPES in API routes

2. **StoryboardMetadataNode**
   - File: `lib/tiptap/extensions/StoryboardMetadataNode.ts`
   - Component: `components/tiptap/nodes/StoryboardMetadataComponent.tsx`
   - Fields: courseTitle, audienceDescription, estimatedDuration, deliveryMechanism

3. **ELearningScreenNode**
   - File: `lib/tiptap/extensions/ELearningScreenNode.ts`
   - Component: `components/tiptap/nodes/ELearningScreenComponent.tsx`
   - Two-column layout: visual description + narration script
   - Fields: screenId, screenTitle, linkedObjectiveId, interactionType

4. **Nested RichTextEditor**
   - File: `components/tiptap/shared/RichTextEditor.tsx`
   - Reusable TipTap instance for rich text fields within blocks

5. **Sync Layer Updates**
   - Update `lib/tiptap/sync.ts` with new block type conversions

### Milestone 3: Remaining Blocks + Block Picker

**Goal:** Complete all block types and add slash command UI.

#### Tasks
1. **Remaining Node Extensions**
   - LearningObjectivesImportNode (with ObjectiveSelector dropdown)
   - ChecklistNode (task/responsible/due table)
   - TableNode (generic configurable)
   - FacilitatorNotesNode (timing, activity type, instructions)
   - MaterialsListNode (categorized equipment list)

2. **Block Picker Modal**
   - File: `components/tiptap/BlockPickerModal.tsx`
   - Triggered by typing `/` at start of line
   - Searchable list of block types
   - Keyboard navigation

3. **Objective Import**
   - Fetch objectives from project via API
   - Allow selection and insertion into document

### Milestone 4: Migration + Polish

**Goal:** Production-ready storyboard editor.

#### Tasks
1. **Lazy Migration**
   - Detect STORYBOARD_FRAME blocks on page load
   - Convert to ELEARNING_SCREEN format in memory
   - Save as new format on first edit

2. **Cleanup**
   - Remove old components: StoryboardView, FrameEditor, FrameList, etc.
   - Remove debug console.log statements

3. **Polish**
   - Keyboard shortcuts (Cmd+B, Cmd+I, etc.)
   - Focus management between blocks
   - Loading states and error handling
   - Performance optimization (memoize node components)

---

## Previous Work Complete

✅ **Foundation Complete** - All infrastructure is in place
- Next.js + TypeScript + Tailwind CSS
- PostgreSQL + Prisma with complete schema
- NextAuth.js OAuth authentication
- AI provider abstraction (OpenAI + Anthropic)
- Block-based page editor
- Workspace layout (Sidebar + TopBar + Canvas)

✅ **TipTap Milestone 1 Complete** - Basic editor working
- TipTap integration with autosave
- Block sync layer
- Markdown shortcuts

---

## Phase 2: End-to-End Workflow (Highest Priority)

**Goal**: Build one complete, shippable workflow from needs analysis through learning objectives.

### Step 1: Workspace & Project Management
**Estimated Time**: 2-3 days

#### Tasks:
1. **Create Workspace Form**
   - File: `app/workspace/new/page.tsx`
   - Fields: name, description
   - API route: `app/api/workspaces/route.ts` (POST)
   - Use Prisma to insert into database

2. **Create Project Form**
   - File: `app/workspace/[workspaceId]/new-project/page.tsx`
   - Fields: name, description, workspace selection
   - API route: `app/api/projects/route.ts` (POST)
   - Link to workspace

3. **Wire Sidebar with Real Data**
   - Update `components/Sidebar.tsx`
   - Fetch workspaces and projects from API
   - Display in collapsible tree
   - Handle loading/error states

4. **Project Home Page**
   - File: `app/workspace/[workspaceId]/project/[projectId]/page.tsx`
   - Show project details
   - List pages (Analysis, Objectives, etc.)
   - Quick actions (new page, view tasks)

**Acceptance Criteria**:
- [ ] Can create workspace through UI
- [ ] Can create project in workspace
- [ ] Sidebar shows real data from database
- [ ] Can navigate to project page
- [ ] Data persists across page refreshes

---

### Step 2: Needs Analysis Page
**Estimated Time**: 2-3 days

#### Tasks:
1. **Create Needs Analysis Template**
   - File: `app/workspace/[workspaceId]/project/[projectId]/needs-analysis/page.tsx`
   - Use BlockEditor component
   - Pre-populate with sections:
     - Business Goal (heading + paragraph)
     - Performance Gap (heading + paragraph)
     - Target Audience (heading + bulleted list)
     - Constraints (heading + bulleted list)

2. **Save/Load Functionality**
   - API route: `app/api/pages/[pageId]/route.ts` (GET, PUT)
   - Save blocks to database (Page model)
   - Load existing page if available

3. **AI-Assisted Analysis**
   - Add "Extract Tasks" button
   - Call `convertNotesToTaskList()` from AI service
   - Display results in modal or side panel
   - Option to save tasks to project

**Acceptance Criteria**:
- [ ] Can create/edit needs analysis page
- [ ] Content saves to database
- [ ] Can load existing needs analysis
- [ ] AI can extract tasks from content
- [ ] Tasks can be saved to database

---

### Step 3: Learning Objectives Page
**Estimated Time**: 3-4 days

#### Tasks:
1. **Objectives List View**
   - File: `app/workspace/[workspaceId]/project/[projectId]/objectives/page.tsx`
   - Fetch objectives from database
   - Display in table: objective, Bloom level, tags
   - Add/edit/delete actions

2. **Add Objective Form**
   - Modal or sidebar form
   - Fields: title, description, Bloom level, tags
   - Save to Objective model
   - Link to project

3. **AI-Generated Objectives**
   - "Generate from Needs Analysis" button
   - Fetch needs analysis content
   - Call `generateLearningObjectives()`
   - Display suggestions
   - User can accept/edit/reject each
   - Bulk save to database

4. **Edit Objective**
   - Inline editing or modal
   - Update in database
   - Optimistic UI updates

**Acceptance Criteria**:
- [ ] Can view all project objectives in table
- [ ] Can manually add new objective
- [ ] Can generate objectives from needs analysis with AI
- [ ] Can edit/delete objectives
- [ ] All changes persist to database

---

### Step 4: Connect the Workflow
**Estimated Time**: 1-2 days

#### Tasks:
1. **Project Dashboard**
   - File: Update `app/workspace/[workspaceId]/project/[projectId]/page.tsx`
   - Show progress: needs analysis complete? objectives count?
   - Quick links to needs analysis and objectives
   - Recent activity

2. **Navigation Flow**
   - Add "Next: Learning Objectives" button to needs analysis page
   - Add "View Needs Analysis" button to objectives page
   - Breadcrumbs in TopBar

3. **Demo Data Seed**
   - File: `prisma/seed.ts`
   - Create sample workspace, project, pages, objectives
   - Run with: `npx prisma db seed`
   - Makes testing easier

**Acceptance Criteria**:
- [ ] Clear navigation between workflow steps
- [ ] Dashboard shows project status
- [ ] Can seed database with demo data
- [ ] Full workflow works end-to-end

---

## Phase 3: Database Views & Templates (Medium Priority)

### Task Database View
**Estimated Time**: 3-4 days

1. **Task List (Table View)**
   - File: `app/workspace/[workspaceId]/project/[projectId]/tasks/page.tsx`
   - Display all tasks
   - Columns: title, status, priority, assignee, due date
   - Filters: status, assignee, date range
   - Sort: any column

2. **Task Kanban Board**
   - Same file, different view mode
   - Columns: TODO, IN_PROGRESS, REVIEW, DONE
   - Drag-and-drop to change status
   - Library: `@dnd-kit/core` or similar

3. **Add/Edit Task**
   - Modal form
   - Fields: title, description, status, priority, assignee, due date, deliverable
   - Link to project

### Project Templates
**Estimated Time**: 2-3 days

1. **Template System**
   - File: `lib/templates/index.ts`
   - Define template structure (pages + their blocks)
   - Example: "Course Design Template" with:
     - Needs Analysis page
     - Task Analysis page
     - Learning Objectives page
     - Assessment Plan page
     - Storyboard page

2. **Apply Template**
   - "Create from Template" option when creating project
   - Copy template structure to new project
   - Create all pages with pre-defined blocks

3. **Custom Templates**
   - Save existing project as template
   - Template management UI

---

## Phase 4: Export & Polish (Lower Priority)

### PDF Export
**Estimated Time**: 2-3 days

1. **PDF Generation**
   - Library: `@react-pdf/renderer` or `puppeteer`
   - Convert block content to PDF format
   - Maintain styling
   - Include branding

2. **Export Button**
   - Add to page actions
   - Generate and download PDF
   - Options: include metadata, headers/footers

### Additional Features
- **Objectives Database View**: Table, Kanban views for objectives
- **Assessment Ideas**: Linked to objectives
- **Search**: Global search across workspace
- **Comments**: Collaboration on pages
- **Version History**: Track page changes

---

## Development Guidelines

### Code Organization

```
app/
├── api/                    # API routes
│   ├── workspaces/
│   ├── projects/
│   ├── pages/
│   ├── objectives/
│   └── tasks/
├── workspace/
│   └── [workspaceId]/
│       ├── new-project/
│       └── project/
│           └── [projectId]/
│               ├── needs-analysis/
│               ├── objectives/
│               ├── tasks/
│               └── ...
```

### API Route Pattern

```typescript
// app/api/objectives/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  const objectives = await prisma.objective.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(objectives);
}

export async function POST(request: Request) {
  const data = await request.json();

  const objective = await prisma.objective.create({
    data,
  });

  return NextResponse.json(objective);
}
```

### Component Pattern

```typescript
// components/ObjectivesList.tsx
'use client';

import { useEffect, useState } from 'react';

interface Objective {
  id: string;
  title: string;
  bloomLevel: string;
  tags: string[];
}

export default function ObjectivesList({ projectId }: { projectId: string }) {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/objectives?projectId=${projectId}`)
      .then(res => res.json())
      .then(data => {
        setObjectives(data);
        setLoading(false);
      });
  }, [projectId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {objectives.map(obj => (
        <div key={obj.id}>
          <h3>{obj.title}</h3>
          <span>{obj.bloomLevel}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## Testing Strategy

### Manual Testing Checklist

For each feature:
- [ ] Happy path works
- [ ] Error handling works (network errors, validation errors)
- [ ] Loading states display correctly
- [ ] Data persists to database
- [ ] UI updates optimistically
- [ ] Works on different screen sizes

### Integration Testing

After Phase 2:
- [ ] Create workspace → create project → add needs analysis → generate objectives → save
- [ ] Verify all data in Prisma Studio
- [ ] Reload page and verify data loads
- [ ] Sign out and sign in, verify data still there

---

## Performance Considerations

### Database Queries
- Use `select` to fetch only needed fields
- Add indexes for frequently queried fields
- Use `include` for relations sparingly

### Client-Side
- Implement pagination for large lists (objectives, tasks)
- Use React Server Components where possible
- Lazy load heavy components (editor, PDF viewer)

### Caching
- Cache static data (workspace list) with SWR or React Query
- Invalidate cache on mutations

---

## Deployment Checklist

When ready to deploy:

### Pre-Deployment
- [ ] Set production environment variables
- [ ] Use production database (not localhost)
- [ ] Generate secure NEXTAUTH_SECRET
- [ ] Configure OAuth redirect URLs for production domain
- [ ] Test with production database locally

### Deploy Options
1. **Vercel** (Recommended for Next.js)
   - Connect GitHub repo
   - Add environment variables
   - Deploy automatically on push

2. **Railway**
   - Deploy both app and database
   - Easy PostgreSQL setup

3. **Self-Hosted**
   - Build: `npm run build` (after fixing NextAuth issue)
   - Start: `npm start`
   - Use PM2 or similar for process management

### Post-Deployment
- [ ] Test authentication flows
- [ ] Verify database connections
- [ ] Test AI features
- [ ] Check error logging
- [ ] Monitor performance

---

## Success Metrics

### Phase 2 Complete When:
- [ ] User can create workspace and project through UI
- [ ] User can write and save needs analysis
- [ ] User can generate objectives from needs analysis with AI
- [ ] User can view, edit, add objectives manually
- [ ] All data persists across sessions
- [ ] Workflow is intuitive and works smoothly

### Phase 3 Complete When:
- [ ] Users can manage tasks in table and Kanban views
- [ ] Users can create projects from templates
- [ ] Templates accelerate project setup

### Phase 4 Complete When:
- [ ] Users can export pages to PDF
- [ ] Additional database views working
- [ ] Basic collaboration features implemented

---

## Resources

### Documentation
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth**: https://next-auth.js.org
- **Tailwind**: https://tailwindcss.com/docs

### Libraries to Consider
- **Forms**: React Hook Form
- **Tables**: TanStack Table (formerly React Table)
- **Drag & Drop**: dnd-kit
- **Date Picker**: react-datepicker
- **Rich Text**: TipTap or Lexical (if needed beyond blocks)
- **PDF**: @react-pdf/renderer or puppeteer
- **State Management**: Zustand or Jotai (if needed)

### AI Tips
- Keep prompts in `lib/ai/prompts.ts` for easy updates
- Log AI calls for debugging and cost tracking
- Implement rate limiting for AI features
- Cache AI responses where appropriate

---

## Questions?

- **Technical Architecture**: See [README.md](./README.md)
- **Setup Issues**: See [SETUP.md](./SETUP.md)
- **Current Status**: See [STATUS.md](./STATUS.md)
- **Design Goals**: See [PRD](../docs/edutex_prd.md)

**Happy coding!** 🚀
