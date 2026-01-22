# EDUTex Project Status

Last Updated: January 22, 2026

---

## Current Version: 0.8.0

## TipTap Storyboard Editor Milestones

### Milestone 1: Basic TipTap Integration
**Status: Complete**

### Milestone 2: Custom Block Nodes
**Status: Complete (January 15, 2026)**
- STORYBOARD_METADATA block
- Original ELEARNING_SCREEN block

### Milestone 2.5: Media Support
**Status: Complete (January 17-20, 2026)**
- IMAGE block (CustomImage extension with blockId)
- VIDEO block (custom VideoNode with YouTube/Vimeo/file support)

### Milestone 3: Block Picker & Core Blocks
**Status: Partially Complete (January 17-21, 2026)**

Completed:
- Block Picker dropdown with 10 block options
- ELEARNING_SCREEN → CONTENT_SCREEN refactor with expanded fields
- LEARNING_OBJECTIVES_IMPORT with auto-fetch and Quick Add

Descoped (moved to Job Aids / Facilitator modules):
- CHECKLIST
- TABLE
- FACILITATOR_NOTES
- MATERIALS_LIST

### Milestone 4: Polish & Migration
**Status: Planned**

---

## Other Feature Areas

| Feature | Status |
|---------|--------|
| Needs Analysis Module | Complete |
| Curriculum Management | Complete |
| Course Creation Flow | Complete |
| Figma Design System | Complete |
| Storyboard Export (Word) | Complete |
| Role-based Navigation | Planned |
| Task & Reminders | Planned |
| GoLive Schedule | Planned |

---

## Tech Stack

- **Framework**: Next.js 15 + React 19
- **Database**: PostgreSQL + Prisma ORM
- **Editor**: TipTap (ProseMirror-based)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Anthropic/OpenAI (with mock mode)

---

*EDUTex - The Instructional Design Analysis & Development Platform*
