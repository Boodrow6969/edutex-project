# EDUTex Quick Reference
**Last Updated:** March 6, 2026
**Current Version:** 0.14.0

---

## Tech Stack
- **Framework:** Next.js 15 + React 19 + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Editor:** TipTap (ProseMirror-based)
- **Styling:** Tailwind CSS + Lucide icons
- **AI:** Anthropic/OpenAI (MOCK_AI=true for dev)
- **Auth:** NextAuth
- **Drag & Drop:** @dnd-kit

---

## Architecture
```
Workspace → Curriculum → Course
Tools (Needs Analysis, Task Analysis, Learning Objectives, etc.)
  ↓ feeds into ↓
Storyboard Modules
```
Tools are independent. Upstream data pre-populates when available. Never required.

---

## What's Built ✅

| Module | Status |
|--------|--------|
| Authentication + Workspace/Course/Curriculum Management | ✅ Complete |
| Needs Analysis — stakeholder forms, approval workflow, reconciled analysis UI | ✅ Complete |
| Learning Objectives Wizard — 6-screen, export, Bloom's alignment | ✅ Complete |
| Task Analysis — step decomposition, priority scoring, learner context | ✅ Complete (sync placeholder only) |
| Storyboard Editor (TipTap) — blocks, autosave, Word export | ✅ Complete (needs testing) |
| Content Assets — upload, CRUD, storyboard integration | ✅ Complete |
| Machine-Consumable Data Layer — enums, LearningTask, AssessmentItem, link tables | ✅ Complete |
| DesignStrategy model | ✅ Schema only |
| Security — tokens, rate limiting, Zod validation | ✅ Complete |

---

## What's NOT Built ❌

| Module | Dependencies | Notes |
|--------|--------------|-------|
| **Quiz Builder** | None — schema exists | Next priority |
| **Job Aids** | Content Assets ✅ | Ready to build |
| **Evaluation Plan** | None | Standalone |
| **Task Analysis bilateral sync** | — | Placeholder only |
| **Assessment Builder** (full) | AssessmentItem schema ✅ | Stub via LO export |
| **HLDD** | — | Referenced but not scoped |
| **SME persistent portal** | — | Phase 2 |
| **Storyboard collaborative review** | — | Phase 2 |

---

## Active Bugs 🐛

| ID | Description | Severity | Workaround |
|----|-------------|----------|------------|
| **BUG-012** | Rapid block addition overwrites previous block | **HIGH** | Wait 2-3 sec + "Saved" indicator before next block |
| BUG-014 | NA dashboard badge shows "Not Started" when links active | Medium | Check NA management screen for true status |
| BUG-016 | REPEATING_TABLE renders as concatenated string in review panel | Minor | None |
| BUG-017 | Duplicate conditional questions in review panel | Minor | None |
| BUG-004 | Extra space above topmost block | Low | Cosmetic |
| BUG-018 | New task accordion steals focus from Description | Low | Collapse and reopen accordion first |
| BUG-015 | No notice when Stakeholder Data button is absent | Low | Approve submission first |
| BUG-019 | Copy Findings Summary only visible in Non-Training filter | Low | Switch filter |

---

## Key Patterns (see docs/edutex-dev-reference.md for full detail)

```ts
// Next.js 15 — params are Promises
type Props = { params: Promise<{ id: string }> }
const { id } = await props.params

// Prisma enums are UPPERCASE
status: 'DRAFT'   type: 'CONTENT_SCREEN'

// ContentScreen JSON requires discriminator
{ _type: 'contentScreen', ... }

// Block model uses `order` not `sortOrder`

// Auth helpers
await getCurrentUserOrThrow()
await assertCourseAccess(userId, courseId)

// Error handling
return errorResponse('message', 400)
```

---

## Key Files

```
claude.md (root)                          — Claude Code rules
docs/edutex-dev-reference.md             — Coding patterns cheat sheet
docs/EDUTEX_BUGS_ENHANCEMENTS.md         — Bug/enhancement tracker
CHANGELOG.md (root)                      — Version history
STATUS.md (root)                         — Current state
prisma/schema.prisma                     — Database schema (PROTECTED)

lib/tiptap/sync.ts                       — Block ↔ TipTap conversion
lib/hooks/useStoryboardEditor.ts         — Editor hook + autosave
lib/questions/                           — Stakeholder NA question constants
lib/types/blocks.ts                      — TypeScript block interfaces
lib/types/courseAnalysis.ts              — Analysis data types
components/tiptap/                       — Storyboard editor components
components/pages/objectives/             — LO Wizard screens
components/pages/task-analysis/          — Task Analysis components
```

---

## Environment

```bash
MOCK_AI=true        # Skip real API calls (dev)
MOCK_AI=false       # Use real Anthropic/OpenAI
```

---

## Common Commands

```powershell
npm run dev                          # Start dev server
npm run build                        # Verify build passes
npx prisma migrate dev --name [x]    # Run migration (requires approval)
npx prisma generate                  # Regenerate client after schema change
npx prisma studio                    # Visual DB browser
```

---

## Build Order — Completed + Remaining

1. ✅ Core platform + auth
2. ✅ Needs Analysis
3. ✅ Stakeholder forms + approval workflow
4. ✅ Content Assets
5. ✅ Storyboard Editor (TipTap)
6. ✅ Task Analysis
7. ✅ Learning Objectives Wizard
8. ✅ Machine-consumable data layer
9. **→ Quiz Builder** (next — no dependencies)
10. Job Aids (Content Assets done)
11. Evaluation Plan
12. Task Analysis bilateral sync
13. Assessment Builder (full)
14. HLDD

---

*EDUTex - The Instructional Design Analysis & Development Platform*
