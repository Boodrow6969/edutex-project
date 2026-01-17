# Next Steps - Milestone 3: Block Picker & Remaining Blocks

## Overview

Milestone 3 focuses on completing the storyboard editor's block system with a user-friendly Block Picker interface and the remaining custom block types.

---

## Tasks

### 1. Block Picker Modal

Create a modal/popover for inserting blocks:

- **Trigger Options**:
  - Slash command (`/`) in empty paragraph
  - "Add Block" button in toolbar
  - Keyboard shortcut (Cmd/Ctrl + /)

- **UI Requirements**:
  - Search/filter blocks by name
  - Categorized sections (Basic, Storyboard, Planning)
  - Block preview icons
  - Keyboard navigation support

- **Files to Create**:
  - `components/tiptap/BlockPicker.tsx`
  - `lib/tiptap/extensions/SlashCommandExtension.ts` (if using slash commands)

### 2. Remaining Block Types

#### CHECKLIST Block
- Task list with checkboxes
- Assignee field per item
- Due date support
- Notes per item

#### TABLE Block
- Configurable columns
- Add/remove rows
- Column types: text, number, date, select
- Header row styling

#### FACILITATOR_NOTES Block
- Section title and timing
- Activity type selector
- Talking points list
- Materials needed list
- Expected outcomes

#### MATERIALS_LIST Block
- Categorized materials
- Quantity tracking
- Required vs optional flags
- Notes per item

#### LEARNING_OBJECTIVES_IMPORT Block
- Import objectives from project blueprint
- Display imported objectives
- Track if edited since import
- Link to source objective

### 3. Cleanup

- Remove test buttons from `StoryboardEditor.tsx` once Block Picker is functional
- Add Block Picker to editor toolbar

---

## File Structure (Milestone 3)

```
lib/tiptap/extensions/
  ├── ChecklistNode.ts
  ├── CustomTableNode.ts
  ├── FacilitatorNotesNode.ts
  ├── MaterialsListNode.ts
  └── LearningObjectivesImportNode.ts

components/tiptap/
  ├── BlockPicker.tsx
  └── nodes/
      ├── ChecklistComponent.tsx
      ├── CustomTableComponent.tsx
      ├── FacilitatorNotesComponent.tsx
      ├── MaterialsListComponent.tsx
      └── LearningObjectivesImportComponent.tsx
```

---

## Database Support

Block types already defined in Prisma schema (`BlockType` enum):
- `CHECKLIST`
- `TABLE`
- `FACILITATOR_NOTES`
- `MATERIALS_LIST`
- `LEARNING_OBJECTIVES_IMPORT`

Mapping constants already defined in `lib/types/blocks.ts`.

---

## Priority Order

1. Block Picker (unlocks all blocks for users)
2. CHECKLIST (most commonly used)
3. TABLE (high utility)
4. FACILITATOR_NOTES (ILT/vILT storyboards)
5. MATERIALS_LIST (ILT/vILT storyboards)
6. LEARNING_OBJECTIVES_IMPORT (requires blueprint integration)

---

*EDUTex - The Instructional Design Analysis & Development Platform*
