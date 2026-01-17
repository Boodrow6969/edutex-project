# EDUTex Project Status

Last Updated: January 17, 2026

---

## Current Version: 0.6.0

## TipTap Storyboard Editor Milestones

### Milestone 1: Basic TipTap Integration
**Status: Complete**

- TipTap editor replaces old frame-based storyboard view
- Block sync layer for bidirectional database conversion
- Autosave with debounce
- Markdown shortcuts for basic formatting
- Basic block types: Paragraph, Headings, Lists, Blockquotes

### Milestone 2: Custom Block Nodes
**Status: Complete (January 15, 2026)**

- `STORYBOARD_METADATA` block (course info header)
- `ELEARNING_SCREEN` block (two-column visuals/script)
- ReactNodeViewRenderer integration for custom React components
- Sync layer extended for custom block types
- Test buttons for block insertion (temporary)

### Milestone 3: Block Picker & Remaining Blocks
**Status: Next Up**

- Block Picker modal (slash command or button)
- Remaining block types:
  - `CHECKLIST`
  - `TABLE`
  - `FACILITATOR_NOTES`
  - `MATERIALS_LIST`
  - `LEARNING_OBJECTIVES_IMPORT`
- Remove test buttons once Block Picker is ready

### Milestone 4: Polish & Migration
**Status: Planned**

- Legacy `STORYBOARD_FRAME` migration
- Drag-and-drop reordering polish
- Block duplication and copy/paste
- Keyboard shortcuts for block operations
- Performance optimizations

---

## Other Feature Areas

| Feature | Status |
|---------|--------|
| Needs Analysis Module | Complete |
| Curriculum Management | Complete |
| Course Creation Flow | Complete |
| Figma Design System | Complete |
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
