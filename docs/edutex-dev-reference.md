# EDUTex Developer Reference
> Condensed patterns for Claude Code and Cursor. Read this before implementing anything.
> Stack: Next.js 15, React 19, TypeScript, Prisma ORM, PostgreSQL, TipTap, Tailwind CSS

---

## Next.js 15 — Critical Patterns

### Route params are Promises (breaking change from Next 14)
```ts
// WRONG — old pattern, will cause TypeScript build error
type Props = { params: { id: string } }
export default async function Page({ params }: Props) {
  const id = params.id
}

// CORRECT — Next.js 15 pattern
type Props = { params: Promise<{ id: string }> }
export default async function Page(props: Props) {
  const { id } = await props.params
}
```

### Server vs Client Components
- Default is Server Component — no interactivity, no hooks, no browser APIs
- Add `"use client"` only when the component needs: useState, useEffect, onClick, browser events, TipTap editor
- Keep `"use client"` as far down the component tree as possible
- Data fetching belongs in Server Components — pass data down as props

```ts
// Server Component (no directive needed)
export default async function Page() {
  const data = await prisma.course.findMany()  // fine here
  return <ClientWidget data={data} />
}

// Client Component
"use client"
export function ClientWidget({ data }) {
  const [selected, setSelected] = useState(null)  // fine here
}
```

---

## Prisma — Critical Patterns

### Enum values are uppercase strings
```ts
// WRONG
status: 'draft'
type: 'content_screen'

// CORRECT
status: 'DRAFT'
type: 'CONTENT_SCREEN'
```

### ContentScreen JSON discriminator
All ContentScreen block JSON must include the `_type` field:
```ts
{
  _type: 'contentScreen',  // required discriminator
  title: '...',
  // other fields
}
```

### Block model uses `order` not `sortOrder`
```ts
// CORRECT field name
{ order: 1 }
```

### Migration sequence — never skip steps
1. Edit `prisma/schema.prisma`
2. Write TypeScript referencing new models
3. Run `npm run build` to catch type errors first
4. Run `npx prisma migrate dev --name description`
5. Run `npx prisma generate`

### Auth pattern — always use these helpers
```ts
const user = await getCurrentUserOrThrow()
await assertCourseAccess(user.id, courseId)
```

### Error handling pattern
```ts
return errorResponse('Message here', 400)
```

### Use transactions for multi-step DB operations
```ts
await prisma.$transaction(async (tx) => {
  await tx.block.upsert({ ... })
  await tx.course.update({ ... })
})
```

---

## React 19 — Critical Patterns

### useEffect cleanup with refs
```ts
// WRONG — ref value may have changed by cleanup time
useEffect(() => {
  return () => clearTimeout(debounceTimers.current)
}, [])

// CORRECT — capture ref value in a variable first
useEffect(() => {
  const timers = debounceTimers.current
  return () => clearTimeout(timers)
}, [])
```

### State rule for EDUTex
- Database = source of truth
- URL = current location/context
- Local React state = only what's on screen right now and doesn't need to survive a reload
- Don't store tool data in component state if it needs to persist
- cross-tool data always round-trips through the database — never passed between tools via component state. 

---

## Architecture — EDUTex Specific

### Hierarchy (never conflate these)
```
Workspace → Curriculum → Course
Tools (Needs Analysis, Task Analysis, Learning Objectives, etc.)
  ↓ feeds into ↓
Storyboard Modules
```

### Tool independence rule
All tools must work standalone. Upstream data (Needs Analysis → Task Analysis → Learning Objectives) pre-populates when available but is never required. Never gate a tool behind another tool's completion.

### Stakeholder token endpoints
Public-facing stakeholder form routes use token-based auth. Always apply Redis rate limiting and Zod validation on these routes.

### MOCK_AI flag
```
MOCK_AI=true   → skips real API calls (use during UI development)
MOCK_AI=false  → uses real Anthropic/OpenAI (use for AI feature testing)
```

---

## Word Export (docx package)

```ts
// Table widths — use DXA not percentage strings
width: { size: 1000, type: WidthType.DXA }

// Bullet lists — use LevelFormat enum
{ level: 0, format: LevelFormat.BULLET }

// Line breaks — separate Paragraph elements, not \n inside text runs
new Paragraph({ children: [new TextRun('Line 1')] }),
new Paragraph({ children: [new TextRun('Line 2')] }),
```

---

## PowerShell vs Git Bash

```powershell
# PowerShell — use semicolon, not &&
npm run build; npx prisma generate

# Git Bash — && works fine
npm run build && npx prisma generate
```

---

## Multi-Machine Sync (Laptop ↔ Desktop)

When syncing to a machine that already has tables but is missing a migration record:
```bash
npx prisma migrate resolve --applied "migration_name"
```
Never use cloud sync (Dropbox etc.) for the codebase. Commit → push → pull only.

---

## Common Build Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `params` type mismatch | Next 15 breaking change | Type params as `Promise<{id: string}>` and await |
| Property does not exist on Prisma type | Schema changed but not migrated | Run migrate dev + prisma generate |
| ESLint ref cleanup warning | React 19 strict ref rules | Capture ref in variable before cleanup |
| `WidthType` not working in docx | Wrong import or method | Use `WidthType.DXA` with numeric size |
