# Session End Routine

Run through this when you're done for the day or stepping away.

## 1. Check for Uncommitted Work

```powershell
git status
```

If you see modified or untracked files, decide now — don't leave them floating.

## 2. If Your Feature Is Done and Tested

```powershell
git add .
git commit -m "feat: [what you built]"
git checkout main
git merge feature/[your-branch]
git push
git branch -d feature/[your-branch]
```

## 3. If Your Feature Is NOT Done

Stay on the feature branch. Commit your progress so it's backed up:

```powershell
git add .
git commit -m "WIP: [where you left off]"
git push -u origin feature/[your-branch]
```

Make the WIP message specific. "WIP: stakeholder form validation done, UI layout next" is useful. "WIP: stuff" is not. Future-you needs to know where to pick up.

## 4. Update Docs (If You Finished Something)

Only if you completed or merged a feature — don't update docs for WIP.

- `CHANGELOG.md` — what you built
- `docs/EDUTEX_BUGS_ENHANCEMENTS.md` — any bugs found or enhancements backlogged
- `docs/STATUS.md` — if the project state changed meaningfully

```powershell
git add .
git commit -m "docs: [what you updated]"
git push
```

## 5. Stop the Dev Server

`Ctrl+C` in the terminal running `npm run dev`. No reason to leave it running.

## 6. Leave Yourself a Note

Add a one-liner at the top of `docs/STATUS.md` or just jot it down somewhere:

- What you were working on
- What's done vs. what's left
- Anything broken or weird you noticed

You will not remember this tomorrow. Write it down now.
