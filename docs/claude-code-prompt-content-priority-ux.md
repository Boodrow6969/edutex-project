# Claude Code Prompt: Content Priority Screen UX Improvements

## Context

The Content Priority screen (Screen 2) in the Learning Objectives Wizard needs UX improvements to be more self-teaching for junior instructional designers. The current implementation has single-letter move buttons (M/S/N) that require prior knowledge, minimal column descriptions, and inconsistent terminology.

## File to Modify

```
src/app/(workspace)/[workspaceId]/curriculum/[curriculumId]/course/[courseId]/objectives/components/Screen2Priority.tsx
```

Also update any downstream references to "Must" / "Should" / "Nice to Have" to use the full terminology. Check:
- `types.ts` — display labels (keep database values as `must`/`should`/`nice` unchanged)
- `Screen5Validation.tsx` — if it displays priority labels
- `Screen6Export.tsx` — if it displays priority labels
- `Screen4Builder.tsx` — priority picker labels
- `constants.ts` — if priority labels are defined there

## Change 1: Terminology — "Must Have / Should Have / Nice to Have"

Change all user-facing labels from "Must" / "Should" / "Nice to Have" to **"Must Have"** / **"Should Have"** / **"Nice to Have"** throughout the wizard. Database column values (`must`, `should`, `nice`) stay unchanged.

Update the COLS config:
```typescript
const COLS: Record<TriageColumn, { label: string; ... }> = {
  must: { label: 'Must Have', ... },
  should: { label: 'Should Have', ... },
  nice: { label: 'Nice to Have', ... },
};
```

Apply this terminology change everywhere priority labels appear in the wizard — builder sidebar, validation dashboard, export screen, etc.

## Change 2: Always-Visible Coaching Text Per Column

Replace the current italic subtitle text with substantive, always-visible coaching descriptions. These teach the junior ID what goes in each column, why, and give them a mental test for classification.

Each column header section should have:
1. **Column title** (bold, colored) — "Must Have" / "Should Have" / "Nice to Have"
2. **What goes here** — 1-2 sentences on the decision criteria
3. **Why it matters** — the instructional design consequence
4. **Decision question** — an italic question they ask themselves to classify each item

### Column Coaching Content

**Must Have** (red)
- What: "Tasks where failure has business consequences — errors, safety risks, compliance violations, or inability to perform the core job."
- Why: "Every Must Have item gets a learning objective and an assessment."
- Decision question: *"Would someone get in trouble or cause harm if they couldn't do this on Day 1?"*

**Should Have** (amber/yellow)
- What: "Important for full proficiency but survivable short-term. People could get by using workarounds, job aids, or asking a colleague."
- Why: "Should Have items get objectives but may use lighter assessment or practice."
- Decision question: *"Could they muddle through the first week without this, even if it's not ideal?"*

**Nice to Have** (gray)
- What: "Good to know, but no learning objective is written. These become job aids, reference materials, or Phase 2 training."
- Why: "If everything is Must Have, nothing is. Protect training scope by being honest about priorities."
- Decision question: *"If we cut this from training entirely, would anyone notice in the first 30 days?"*

### Layout for Column Headers

```
┌─────────────────────────────────┐
│ Must Have                     3 │  ← title + count
│                                 │
│ Tasks where failure has         │  ← "what" text (text-[11px], normal weight)
│ business consequences — errors, │
│ safety risks, compliance        │
│ violations, or inability to     │
│ perform the core job.           │
│                                 │
│ Every Must Have item gets a     │  ← "why" text (text-[11px], semibold, 
│ learning objective and an       │     slightly different style to distinguish)
│ assessment.                     │
│                                 │
│ Would someone get in trouble    │  ← decision question (text-[11px], italic)
│ or cause harm if they couldn't  │
│ do this on Day 1?               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Navigate mySFS portal...    │ │  ← triage items start here
│ │ From NA    → Should  → Nice │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

Use a subtle divider (a thin border or extra spacing) between the coaching text and the item list so the items don't visually crowd the description.

## Change 3: Move Buttons — Arrow with Target Label

Replace the single-letter buttons (M, S, N) with arrow buttons that include the target column name.

Current:
```
[M] [N]     (on an item in the Should column)
```

New:
```
[→ Must Have] [→ Nice to Have]    (on an item in the Should column)
```

For items in the leftmost column (Must Have), buttons point right:
```
[→ Should Have] [→ Nice to Have]
```

For items in the rightmost column (Nice to Have), buttons point left:
```
[← Must Have] [← Should Have]
```

For items in the middle column (Should Have), use directional arrows matching position:
```
[← Must Have] [→ Nice to Have]
```

### Button Styling

- Slightly larger than current (at minimum `text-[10px]`, `px-2 py-0.5`)
- Keep the color coding from the target column
- Arrow character + space + target label: `← Must Have` or `→ Nice to Have`
- Buttons stack vertically under the item text (not inline to the right) to avoid horizontal crowding — the column widths are narrow

### Button Layout Per Item

```
┌─────────────────────────────────┐
│ Navigate mySFS portal and       │
│ locate account information      │
│ From NA                         │
│                                 │
│ [← Must Have]  [→ Nice to Have] │  ← buttons below text, horizontal if space allows
└─────────────────────────────────┘
```

If horizontal space is too tight for both buttons on one line, stack them:
```
│ [← Must Have]                   │
│ [→ Nice to Have]                │
```

Use `flex-wrap` so buttons flow naturally based on available space.

## Change 4: Page Subtitle and Footer Theory Citation

### Subtitle
Change from:
```
Only Must and Should proceed to objectives.
```
To:
```
Classify tasks by business impact. Only "Must Have" and "Should Have" items become learning objectives.
```

### Footer
Replace the current footer hint with a theory citation:

```
Content triage separates what training must accomplish from what's merely nice to cover. 
Prioritize by business consequence, not topic familiarity. 
— Mager (1997): if the consequence of not performing is trivial, it's not a training priority. 
  Moore (2017): Action Mapping prioritizes tasks by business impact, not topic coverage.
```

Style this as a coaching note — small text (text-[11px]), muted color, with the citations in a slightly different style (e.g., italic or a left accent bar like the coaching notes elsewhere in EDUTex).

## Change 5: Add Item Input — Default Column

Currently new items default to `must` column. Change the default to `should` — it's a safer default. It's easier to promote something to Must Have than to demote it from Must Have (psychologically, moving things "down" feels like a loss). This nudges toward appropriate scoping rather than scope creep.

## Summary of Changes

| Change | What | Why |
|--------|------|-----|
| Terminology | "Must Have" / "Should Have" / "Nice to Have" everywhere | Reads as complete phrase, consistent |
| Column coaching | Always-visible what/why/question per column | Teaches triage decision-making |
| Move buttons | `← Must Have` / `→ Nice to Have` with arrows | Self-documenting, no prior knowledge needed |
| Button layout | Below item text, flex-wrap | Fits narrow columns |
| Subtitle | "Classify tasks by business impact..." | Frames the purpose |
| Footer | Theory citation (Mager, Moore) | Grounds the practice in theory |
| Default column | New items → Should Have | Safer default, reduces scope creep |

## Do NOT Change

- Database column values (`must`, `should`, `nice`) — only display labels change
- Triage item data model
- The add-item input/button design (just the default column)
- Autosave behavior
- Overall three-column layout
