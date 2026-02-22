# Session Start Routine

Run these steps EVERY TIME you open Cursor or start a Claude Code session.

## 1. Confirm You're in the Right Folder

```powershell
cd C:\Dev\edutex 
pwd
```

You should see `C:\Dev\edutex`. If not, you're in the wrong directory.

## 2. Check Git Status

```powershell
git status
```

Look for:
- Which branch are you on? (should be `main` or a `feature/` branch)
- Any uncommitted changes from last session?
- Any untracked files that shouldn't be there?

If there are leftover changes from a previous session, commit or stash them before starting new work.
check git-session-start-instructions.md for instructions

## 3. Verify the Dev Server Starts

```powershell
npm run dev
```

Open `http://localhost:3000` in your browser. Log in. Confirm the dashboard loads. If it doesn't, fix it before doing anything else.

## 4. Create a Feature Branch (if starting new work)

```powershell
git checkout -b feature/[descriptive-name]
```

Never start new feature work directly on `main`.

## 5. If Using Claude Code in Terminal

```powershell
claude
```

Claude Code will read `claude.md` from the project root automatically. Verify by asking: "What project rules are you following?"

## Quick Reference

| Command | Purpose |
|---------|---------|
| `pwd` | Confirm current directory |
| `git status` | Check branch and uncommitted changes |
| `git branch` | List all branches |
| `npm run dev` | Start dev server |
| `npm run build` | Verify build passes |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma migrate dev` | Apply schema migrations (requires approval) |

## Current State (updated 2026-02-21)

- **Active branch:** main
- **Needs Analysis reconciliation** is merged to main
- **Course dashboard revamp** is merged to main
- Both systems are now unified: stakeholder submission data flows into the course-level Analysis tab
- Stakeholder Data panels on Tasks & Competencies and Training Decision now use **section-title-based filtering** (works across all 4 training types: Performance Problem, New System, Compliance, Role Change)
- Migration history was cleaned up for laptop environment: single init migration + needs-analysis-reconciliation migration + add-dashboard-statuses migration
- **When returning to desktop:** need to either baseline migrations with `prisma migrate resolve` or nuke and recreate the desktop DB

### Next Priorities
1. Browser test all 4 training types through the full NA → Analysis tab pipeline
2. Wire the NeedsAnalysisPanel (Task Analysis reference panel) to pull from the new analysis-context API
3. Complete remaining dashboard cards (Job Aids, Assessment, Evaluation)
4. Remove `edutex_backup.sql` from repo and add to `.gitignore`

## Development Workflow Best Practices

### Think Here, Build There
- Use Claude chat for strategy, architecture, planning, and review
- Use Claude Code in Cursor for implementation, file reading, running commands
- When Claude chat needs current file/schema/route data, use Claude Code to extract it:

**Claude Code extraction prompt template:**
```
Read [file path] and give me a summary of: [specific data needed].
Output as a concise reference I can paste into a Claude chat.
```

### Prompt Structure (CoT Pattern)
- Always require reasoning before code output
- Break complex tasks into explicit steps

**Planning prompt example:**
```
I need to build [feature]. Before writing any code:

1. Review the current schema and identify what models/relations exist
2. Identify what new models/routes/components are needed
3. Consider how it connects to existing modules
4. Outline the approach
5. Then implement
```

**Diagnostic-first prompt example:**
```
Look at /features/[module]/ and schema.prisma.
What's missing before I can build [feature]? Don't write code yet—just tell me.
```

**Pattern-matching prompt example:**
```
Generate the API route for [new module] CRUD.
Must follow the same patterns as [existing module] routes. Check those first.
```

### Precision Triggers
- Add stakes language for schema/migration work:
  "This migration touches production data patterns. Double-check foreign key relationships before generating."
- Break features into discrete commits: schema/migration → API routes → UI components
- Show existing code files as format examples when requesting new code that should follow established patterns

### Anti-Patterns to Avoid
- Don't paste large files into Claude chat when Claude Code can read them directly
- Don't ask Claude Code to "build the module" without reasoning steps first
- Don't skip the diagnostic step—always ask what exists before creating new things
