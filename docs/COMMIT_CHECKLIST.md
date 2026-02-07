# Pre-Commit Checklist

Run through this EVERY time before `git add .` — no exceptions.

## Before Committing

- [ ] Dev server is running (`npm run dev`) and the app loads without errors
- [ ] Logged in and can see dashboard/workspace
- [ ] Tested the specific thing I changed (inserted a block, submitted a form, whatever the feature is)
- [ ] Tested one adjacent thing I didn't change (does storyboard still save? does navigation still work?)
- [ ] Checked browser console for new errors or warnings

## The Commit Itself

- [ ] This commit covers ONE logical change (not a refactor + new feature + bug fix)
- [ ] Commit message describes what and why, not just file names
- [ ] If on a feature branch: stay on it until testing is done, merge to main only after all checks pass

## If Anything Failed

- On a feature branch: `git checkout main` and the damage stays contained
- On main: `git stash` your changes, verify main works, then `git stash pop` and fix
- If truly broken: `git reset --hard HEAD~1` to undo the last commit (nuclear option)

## After Pushing

- [ ] `git status` shows clean working tree
- [ ] Update docs if the change warrants it (CHANGELOG, BUGS_ENHANCEMENTS, STATUS)
