# EduTex Foundation - Implementation Summary

This document summarizes the technical architecture and implementation details of the EduTex instructional design workspace.

**Last Updated:** January 4, 2026

---

## ✅ TipTap Storyboard Editor (v0.5.0)

### Architecture Overview

The storyboard editor uses TipTap (a headless ProseMirror wrapper) to provide a Notion-like block editing experience. Content is stored as Block records in the database and converted to/from TipTap's JSON format.

```
┌─────────────────────────────────────────────────────────────┐
│                    StoryboardEditor.tsx                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              useStoryboardEditor hook                │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │    │
│  │  │   TipTap    │  │   Autosave  │  │    API     │  │    │
│  │  │   Editor    │←→│   (2s deb)  │→→│   Calls    │  │    │
│  │  └─────────────┘  └─────────────┘  └────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                            ↓                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   sync.ts                            │    │
│  │  blocksToTipTap()  ←→  tipTapToBlocks()             │    │
│  └─────────────────────────────────────────────────────┘    │
│                            ↓                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Database (Block model)                  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `components/tiptap/StoryboardEditor.tsx` | Main editor component with header, save status, word count |
| `lib/hooks/useStoryboardEditor.ts` | React hook managing editor state, autosave, and API calls |
| `lib/tiptap/sync.ts` | Bidirectional conversion between Block[] and TipTap JSONContent |
| `lib/tiptap/extensions/index.ts` | TipTap extension configuration (StarterKit + custom) |
| `lib/types/blocks.ts` | TypeScript interfaces for block content schemas |

### Block Sync Layer

The sync layer handles conversion between database Block records and TipTap's document format:

**blocksToTipTap(blocks: Block[]): JSONContent**
- Converts Block[] from database to TipTap document
- Maps BlockType to TipTap node types (PARAGRAPH→paragraph, HEADING_1→heading, etc.)
- Preserves blockId as node attribute for tracking

**tipTapToBlocks(doc: JSONContent, existingBlocks: Block[]): SyncResult**
- Compares TipTap document with existing blocks
- Returns: `{ toCreate, toUpdate, toDelete, orderUpdates }`
- Tracks blockId to determine which blocks changed

### Autosave Pattern

```typescript
// useStoryboardEditor.ts autosave implementation
const handleUpdate = () => {
  // Clear existing timer
  if (autosaveTimerRef.current) {
    clearTimeout(autosaveTimerRef.current);
  }

  // Schedule save after delay (2 seconds)
  autosaveTimerRef.current = setTimeout(() => {
    save();
  }, autosaveDelay);
};

editor.on('update', handleUpdate);
```

Key aspects:
- **Debounced**: 2-second delay prevents saves during active typing
- **Content comparison**: Skips save if content unchanged
- **Local state update**: After save, updates local blocks state to prevent stale refs
- **Idempotent deletes**: Treats 404 on DELETE as success (block already gone)

### TipTap Extensions

The editor uses StarterKit with customizations:

```typescript
// lib/tiptap/extensions/index.ts
export function getStoryboardExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Placeholder.configure({
      placeholder: 'Start writing your storyboard...',
    }),
    BlockIdExtension,      // Tracks blockId for sync
    CalloutVariantExtension, // Adds variant attr to blockquote
  ];
}
```

### Supported Block Types

| BlockType | TipTap Node | Markdown Shortcut |
|-----------|-------------|-------------------|
| PARAGRAPH | paragraph | (default) |
| HEADING_1 | heading (level 1) | `#` |
| HEADING_2 | heading (level 2) | `##` |
| HEADING_3 | heading (level 3) | `###` |
| BULLETED_LIST | bulletList | `-` |
| NUMBERED_LIST | orderedList | `1.` |
| CALLOUT | blockquote | `>` |

---

## ✅ Phase 1: Foundation - COMPLETE

### 1. Modern Next.js Application
- Next.js 15 with TypeScript and Tailwind CSS
- App Router architecture for scalable routing
- Clean, maintainable code structure

### 2. Comprehensive Database Layer
- Prisma ORM with PostgreSQL
- Complete schema for all core models:
  - Authentication (User, Account, Session)
  - Workspaces and Courses (renamed from Projects in v0.9.1)
  - Pages with block-based content
  - Learning Objectives with Bloom's Taxonomy
  - Tasks and Deliverables
  - Role-based access (Administrator, Manager, Designer, Facilitator, SME)

### 3. Authentication System
- NextAuth.js v5 with OAuth support
- Google and GitHub providers configured
- Microsoft ready to add
- Custom sign-in page
- JWT sessions

### 4. AppFlowy-Inspired UI
- **Sidebar**: 256px left navigation with collapsible workspace/course tree
- **TopBar**: Context-aware breadcrumbs and actions
- **Main Canvas**: Scrollable content area
- Clean, minimalist design focused on productivity

### 5. AI Provider Abstraction
- Pluggable architecture supporting multiple providers
- OpenAI GPT-4 integration
- Anthropic Claude integration
- **Instructional Design Functions**:
  - Convert SME notes → task lists
  - Generate learning objectives with Bloom levels
  - Suggest assessments aligned to objectives
  - Analyze needs analysis documents
  - Generate executive summaries

### 6. Block-Based Page Editor
- Rich content editor with 12+ block types
- **Basic blocks**: Paragraph, Headings (H1-H3), Lists, Callout
- **ID-specific blocks**: Learning Objective with Bloom level selector
- Add/delete/reorder functionality
- Extensible for future block types

## 📁 Deliverables

### Code & Configuration
- 30+ files across app structure
- Fully typed TypeScript codebase
- Tailwind CSS styling system
- Environment variable templates

### Documentation
- **README.md** - Project overview and quick start
- **SETUP.md** - Comprehensive setup guide (OAuth, database, AI providers)
- **STATUS.md** - Current implementation status
- **NEXT_STEPS.md** - Detailed roadmap for next development phases

## 🎯 Key Features Working

✅ Development server runs perfectly (`npm run dev`)
✅ Database schema complete and ready for migrations
✅ Block editor fully functional at `/workspace/test-editor`
✅ AI helper functions implemented and tested
✅ Layout matches AppFlowy-inspired design
✅ Full TypeScript type safety

## ⚠️ Known Issue

**Production build** currently fails due to NextAuth.js v5 (beta) + Prisma adapter compatibility during static generation. This is a known issue with the beta version.

**Workarounds**:
- Use development mode (works perfectly)
- Deploy to Vercel/Netlify (handles dynamic routes)
- Wait for NextAuth v5 stable release

## 🚀 Ready for Next Phase

The foundation is solid and ready for feature development. Next steps:

**Phase 2**: Build end-to-end workflow
1. Workspace/Course CRUD operations
2. Needs Analysis page with AI assistance
3. Learning Objectives page with generation
4. Connect the full workflow

All next steps are documented in **NEXT_STEPS.md** with time estimates and acceptance criteria.

## 📊 Tech Stack

| Component | Technology | Status |
|-----------|-----------|--------|
| Framework | Next.js 15 | ✅ |
| Language | TypeScript 5.7 | ✅ |
| Styling | Tailwind CSS 3.4 | ✅ |
| Database | PostgreSQL + Prisma 7 | ✅ |
| Auth | NextAuth.js v5 | ✅ Dev Mode |
| AI | OpenAI + Anthropic | ✅ |

**The foundation is complete, documented, and ready for productive development!**
