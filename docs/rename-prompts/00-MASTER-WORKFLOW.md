# EDUTex: Project → Course Rename — Complete Workflow

Branch: `refactor/project-to-course-rename`
Created: 2026-02-08

---

## ✅ ALREADY DONE

1. Created branch `refactor/project-to-course-rename`
2. Replaced `prisma/schema.prisma` with renamed version
3. Applied hand-written migration SQL (tables + columns renamed)
4. Ran `npx prisma migrate dev` — database synced
5. Ran `npx prisma generate` — Prisma client regenerated
6. Ran `npx tsc --noEmit` — captured full error list

---

## PHASE 2A: Directory Renames and Moved Files

### What to do
1. Open Cursor
2. Paste the ENTIRE contents of `phase2a-directory-renames.md`
3. Let Cursor rename directories and fix all moved files

### After Cursor finishes
Run in PowerShell:
```powershell
npx tsc --noEmit 2>&1 | Select-String "projectId|prisma.project|Project"
```
Errors WILL remain — that's expected. The in-place files haven't been fixed yet.

Do NOT commit yet. Move straight to 2B.

---

## PHASE 2B: In-Place File Edits

### What to do
1. In the SAME Cursor chat (or a new one), paste the ENTIRE contents of `phase2b-inplace-edits.md`
2. Let Cursor fix all remaining API routes, auth helpers, libraries, and seed file

### After Cursor finishes
Run in PowerShell:
```powershell
npx tsc --noEmit 2>&1 | Select-String "projectId|prisma.project|Project"
```

**If errors remain:** Paste the remaining errors back into Cursor with:
```
These TypeScript errors remain from the Project → Course rename. Fix each one.
Only rename identifiers — do not change logic.
<paste errors>
```
Repeat until clean (or only non-rename errors remain).

**When clean:** Commit both 2A and 2B together:
```powershell
git add -A
git commit -m "refactor: rename Project → Course in all API routes, libraries, and auth helpers"
```

---

## PHASE 3: UI Routes, Components, Hooks, Types

### What to do
1. In Cursor, start a NEW chat (clean context)
2. Paste the ENTIRE contents of `phase3-full-prompt.md`
3. Let Cursor work through all the renames

### After Cursor finishes
Run in PowerShell:
```powershell
npx tsc --noEmit 2>&1 | Select-String "projectId|prisma.project|Project|projectName"
```

**If errors remain:** Paste them back into Cursor.

**Then test in browser:**
```powershell
npm run dev
```
1. Dashboard loads
2. Sidebar shows workspaces with courses
3. Click a course → URL is `/workspace/[id]/course/[courseId]`
4. Storyboard editor loads
5. "+ New Course" button works

**If all good:** Commit:
```powershell
git add -A
git commit -m "refactor: rename Project → Course in UI routes, components, hooks, and types"
```

---

## PHASE 4: Documentation

### What to do
1. In Cursor, start a NEW chat (clean context)
2. Paste the ENTIRE contents of `phase4-full-prompt.md`

### After Cursor finishes
Quick verification:
```powershell
Select-String -Path "*.md","docs\*.md" -Pattern "projectId|prisma\.project|/api/projects|assertProjectAccess" -Recurse | Where-Object { $_.Path -notmatch "CHANGELOG|migrations|node_modules" }
```

Should return zero results.

**Commit:**
```powershell
git add -A
git commit -m "docs: update all documentation for Project → Course rename"
```

---

## PHASE 5: Merge

```powershell
git checkout main
git merge refactor/project-to-course-rename
```

### Post-merge verification

**Database:**
```powershell
npx prisma studio
```
Confirm `courses` table exists, no `projects` table, `courseId` columns everywhere.

**TypeScript:**
```powershell
npx tsc --noEmit
```

**Browser:**
```powershell
npm run dev
```
Walk through: login → dashboard → workspace → course → storyboard → create new course

**Final grep:**
```powershell
Select-String -Path "app\**\*.ts","app\**\*.tsx","lib\**\*.ts","components\**\*.tsx" -Pattern "prisma\.project[^s]|projectId|assertProjectAccess|getProjectOverview" -Recurse
```
Should return nothing outside of migration files and CHANGELOG history.

---

## THEN: Archive/Delete Feature

```powershell
git checkout -b feature/archive-delete
```

The Course model is clean and ready for `archivedAt DateTime?` field additions.

---

## Troubleshooting

### "Cursor missed some files"
Run `npx tsc --noEmit` and grep commands after each phase. Paste remaining errors back into Cursor.

### "Browser shows 404 on old /project/ URLs"
Clear `.next` cache:
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

### "Prisma Studio shows wrong column names"
```powershell
npx prisma generate
npx prisma studio
```

### "Seed file fails"
Check `prisma/seed.ts` for any remaining `prisma.project` or `projectId`.

### "Import paths broken after directory rename"
```powershell
Select-String -Path "app\**\*.ts","app\**\*.tsx","lib\**\*.ts" -Pattern "from.*lib/projects|from.*api/projects" -Recurse
```
