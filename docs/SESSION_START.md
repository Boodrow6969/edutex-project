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
