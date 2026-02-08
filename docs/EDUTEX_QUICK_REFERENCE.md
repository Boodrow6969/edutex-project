# EDUTex Quick Reference
**Last Updated:** January 22, 2026  
**Current Version:** 0.8.0

---

## Tech Stack
- **Framework:** Next.js 15 + React 19 + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Editor:** TipTap (ProseMirror-based)
- **Styling:** Tailwind CSS + Lucide icons
- **AI:** Anthropic/OpenAI (MOCK_AI=true for dev)

---

## What's Built ✅

### Core Modules
| Module | Status |
|--------|--------|
| Needs Analysis (5 tabs) | ✅ Complete |
| Learning Objectives | ✅ Complete |
| Curriculum Management | ✅ Complete |
| Workspace Navigation | ✅ Complete |
| Course Creation Flow | ✅ Complete |

### TipTap Storyboard Editor
| Milestone | Status |
|-----------|--------|
| M1: Foundation + Autosave | ✅ Complete |
| M2: Custom Blocks | ✅ Complete |
| M2.5: IMAGE + VIDEO | ✅ Complete |
| M3: Block Picker | ✅ Complete |
| M3: CONTENT_SCREEN | ✅ Complete |
| M3: LEARNING_OBJECTIVES_IMPORT (course objectives auto-fetch) | ✅ Complete |
| Export to Word (.docx) | ✅ Complete |

### Available Block Types (in BlockPicker)
1. Course Information (STORYBOARD_METADATA)
2. Content Screen (CONTENT_SCREEN)
3. Learning Objectives (LEARNING_OBJECTIVES_IMPORT)
4. Image (IMAGE)
5. Video (VIDEO)
6. Heading
7. Paragraph
8. Bullet List
9. Numbered List
10. Quote / Callout

---

## What's NOT Built ❌

### Priority Modules (Ready to Build)
| Module | Dependencies | Notes |
|--------|--------------|-------|
| **Quiz Builder** | None | Start here |
| **Content Assets** | None | Foundation for Job Aids |
| **Job Aids** | Content Assets | Drag-and-drop media |
| **Evaluation Plan** | None | Standalone |

### Descoped from Storyboard (Moved Elsewhere)
- CHECKLIST → Job Aids or separate module
- TABLE → Job Aids or separate module
- FACILITATOR_NOTES → Facilitator Guide module
- MATERIALS_LIST → Facilitator Guide module

### Future / Phase 2
- Designer Dashboard
- Manager Dashboard
- SME Dashboard
- Articulate Review 360 integration
- In-app messaging
- Email templates

---

## Active Bugs 🐛

| ID | Description | Severity | Workaround |
|----|-------------|----------|------------|
| **BUG-012** | Rapid block addition overwrites | **HIGH** | Wait 2-3 sec between blocks |
| BUG-001 | Modal flash on course create | Low | None needed |
| BUG-002 | Clunky delete popup | Medium | Use native confirm |
| BUG-004 | Extra space above first block | Low | Cosmetic only |

### BUG-012 Details (Critical)
- **Location:** `useStoryboardEditor.ts`, `sync.ts`
- **Root cause:** `blockId` not preserved through `setContent()` for Image/Video
- **Status:** Deferred to post-MVP
- **Fix options:**
  1. Add blockId to Image/Video extension attributes
  2. Use transactions instead of setContent
  3. Client-side temporary IDs

---

## Key Enhancements Backlog

| ID | Description | Priority |
|----|-------------|----------|
| ENH-008 | Reorganize Block Picker menu | Medium |
| ENH-011 | Reorder blocks (up/down arrows) | Medium |
| ENH-012 | Content Assets in Storyboard | Medium |
| ENH-015 | Node-based flow visualization | Medium |

Full list: `docs/EDUTEX_BUGS_ENHANCEMENTS.md`

---

## Key Files Reference

### Documentation
```
/STATUS.md                    # Course/project status
/CHANGELOG.md                 # Version history
/NEXT_STEPS.md               # Current priorities
/docs/EDUTEX_BUGS_ENHANCEMENTS.md  # Bug/enhancement tracker
```

### TipTap Implementation
```
lib/tiptap/
├── extensions/
│   ├── index.ts              # All extensions configured
│   ├── StoryboardMetadataNode.ts
│   ├── ContentScreenNode.ts
│   ├── LearningObjectivesImportNode.ts
│   └── VideoNode.ts
└── sync.ts                   # Block ↔ TipTap conversion

lib/hooks/useStoryboardEditor.ts  # Editor hook + autosave

components/tiptap/
├── BlockPicker.tsx           # Block insertion dropdown
├── StoryboardEditor.tsx      # Main editor component
└── nodes/                    # React components for blocks
```

### Schema
```
prisma/schema.prisma          # BlockType enum, all models
lib/types/blocks.ts           # TypeScript interfaces
```

---

## Environment

```bash
# Development
MOCK_AI=true                  # Skip real API calls
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...

# Production
MOCK_AI=false
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

---

## Common Commands

```powershell
# Start dev server
cd D:\Dropbox\Dropbox\EduTex\app
npm run dev

# Database
npx prisma migrate dev        # Run migrations
npx prisma studio            # Visual DB browser
npx prisma db seed           # Seed test data

# Git
git add .
git commit -m "message"
git push
```

---

## Build Order (Recommended)

1. ✅ ~~Needs Analysis~~
2. ✅ ~~Curriculum Management~~
3. ✅ ~~TipTap Storyboard (M1-M3)~~
4. ✅ ~~Export to Word~~
5. **→ Quiz Builder** (next)
6. Content Assets
7. Job Aids
8. Evaluation Plan
9. Dashboards (Phase 2)

---

*EDUTex - The Instructional Design Analysis & Development Platform*
