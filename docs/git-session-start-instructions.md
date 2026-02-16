## 2. Check Git Status

Run this in your PowerShell terminal (make sure you're in the `C:\Dev\edutex` folder):

```powershell
git status
```

This tells you three things:
- **What branch you're on** — You should see `main` or a `feature/something` branch name at the top.
- **Modified files** — Files you changed but haven't saved to Git yet.
- **Untracked files** — New files Git doesn't know about yet.

### If there are leftover changes (modified or untracked files listed):

You need to "save" them to Git before starting new work. Think of it like saving a document — Git needs two steps: **stage** (select what to save) and **commit** (actually save it with a note).

**Step 1 — Stage all changes:**

```powershell
git add -A
```

> **What this does:** Tells Git "include ALL changed and new files in my next save." The `-A` means "everything."

**Step 2 — Commit (save) with a message:**

```powershell
git commit -m "brief description of what changed"
```

> **What this does:** Saves a snapshot of your code with a short note. The `-m` flag means "here's my message." Always put the message in quotes.

**Examples of good commit messages:**
- `"docs: update status and changelog"`
- `"fix: correct button alignment on storyboard page"`
- `"feat: add content assets upload"`

**Step 3 — Push to GitHub:**

```powershell
git push
```

> **What this does:** Sends your saved snapshot to GitHub (your online backup). Without this, your commit only exists on your computer.

### Quick reference (copy-paste ready):

```powershell
git status
git add -A
git commit -m "your message here"
git push
```

### If git status shows nothing (clean):

You'll see:

```
nothing to commit, working tree clean
```

This means you're good to go — no leftover changes. Start your new work.

### Common PowerShell gotcha:

PowerShell doesn't support `&&` to chain commands. Use a semicolon `;` instead:

```powershell
# This will ERROR:
git add -A && git commit -m "message"

# This works:
git add -A; git commit -m "message"
```
