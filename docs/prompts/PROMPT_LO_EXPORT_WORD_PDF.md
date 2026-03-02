# Claude Code Prompt: Learning Objectives Wizard — Export to Word & PDF

## Context

You are working on EDUTex, a Next.js 15 / React 19 / TypeScript / Prisma / PostgreSQL instructional design platform.

The Learning Objectives Wizard lives at:
`app/workspace/[workspaceId]/course/[courseId]/objectives/`

Screen 6 (Export & Downstream Handoff) currently has placeholder export buttons. We are making the **Export to Word (.docx)** and **Export to PDF** buttons functional.

An existing storyboard Word export already exists and should be used as a **pattern reference** (not copied verbatim):
- Export lib: `lib/export/storyboard-to-docx.ts`
- API route: `app/api/pages/[pageId]/export/route.ts`

The `docx` npm package is already installed in the project.

## Before Writing Code

1. Read `lib/export/storyboard-to-docx.ts` to understand the existing export pattern (imports, Document structure, Packer usage, how it returns a buffer)
2. Read the Objective model in `prisma/schema.prisma` — note all fields: title, description, bloomLevel, priority, condition, criteria, linkedTriageItemId, etc.
3. Read Screen 6 component (likely `Screen6Export.tsx` or similar in `components/objectives/`) to see current placeholder button handlers
4. Read `ObjectivesWizard.tsx` to understand how objective data is structured in state
5. Read the TriageItem model in schema to understand parent task data
6. Check `lib/auth-helpers.ts` for `getCurrentUserOrThrow`, `assertCourseAccess`, `errorResponse` patterns

## What to Build

### Part A: Export Library — `lib/export/objectives-to-docx.ts`

Create a new file that generates a formatted Word document from objectives data.

**Function signature:**
```typescript
export async function generateObjectivesDocx(data: {
  courseName: string;
  courseType?: string;
  exportDate: string;
  objectives: Array<{
    id: string;
    title: string;
    description?: string | null;
    bloomLevel?: string | null;
    priority?: string | null;
    condition?: string | null;
    criteria?: string | null;
    linkedTriageItemId?: string | null;
    parentTaskTitle?: string | null;
  }>;
  triageItems: Array<{
    id: string;
    title: string;
    column: string;
  }>;
  validationSummary?: {
    totalObjectives: number;
    withParentTask: number;
    orphaned: number;
    bloomDistribution: Record<string, number>;
  };
}): Promise<Buffer>
```

**Document structure (in this order):**

1. **Title page section:**
   - Title: "Learning Objectives" (Heading 1, primary color #03428e)
   - Subtitle: course name
   - Date line: export date
   - Page break after

2. **Summary section:**
   - Heading 2: "Summary"
   - Total objectives count
   - Bloom's Taxonomy distribution as a table (Level | Count | Percentage)
   - Traceability: X of Y objectives linked to parent tasks
   - Orphan warning if any objectives lack parent tasks

3. **Objectives by Parent Task section:**
   - Heading 2: "Objectives by Parent Task"
   - For each parent task that has linked objectives:
     - Heading 3: parent task title + priority badge
     - For each objective under that task, render an **objective card** (see below)
   - If there are orphaned objectives (no parent task):
     - Heading 3: "Unlinked Objectives"
     - Render each orphaned objective as an objective card

4. **Objective card format** (for each objective):
   - Table with 2 columns (label | value), light gray header row
   - Row: "Objective" | objective title (bold)
   - Row: "Bloom's Level" | bloomLevel value
   - Row: "Priority" | priority value
   - Row: "Audience" | from description or "All learners" default
   - Row: "Behavior" | title (the action verb + observable behavior)
   - Row: "Condition" | condition field or "—"
   - Row: "Criteria" | criteria field or "—"
   - If description exists and differs from title: Row: "Full Description" | description
   - Spacing after each table

5. **Appendix: All Triage Items section:**
   - Heading 2: "Appendix: Content Triage Summary"
   - Table: Task | Priority Column (Must Have / Should Have / Nice to Have)
   - Only include if triageItems array is non-empty

**Formatting rules (from docx skill):**
- US Letter page size: width 12240, height 15840 DXA
- 1 inch margins (1440 DXA all sides)
- Font: Arial throughout
- Default text size: 24 (12pt)
- Heading 1: size 32, bold, color #03428e
- Heading 2: size 28, bold
- Heading 3: size 26, bold
- Use proper numbering config for bullet lists (LevelFormat.BULLET), never unicode bullets
- Tables: use WidthType.DXA, set both columnWidths and cell width, use ShadingType.CLEAR for header shading
- Use PageBreak between major sections
- Never use `\n` — use separate Paragraph elements

### Part B: API Route — `app/api/courses/[courseId]/objectives/export/route.ts`

Create a GET endpoint that:

1. Authenticates with `getCurrentUserOrThrow()` and `assertCourseAccess()`
2. Accepts query param `?format=docx` or `?format=pdf`
3. Fetches from database:
   - Course name and type
   - All Objectives for this course (include all fields)
   - All TriageItems for this course
   - For each objective with linkedTriageItemId, resolve the parent task title
4. Computes validation summary (total, linked count, orphan count, bloom distribution)
5. Calls `generateObjectivesDocx()` with the assembled data
6. For `format=docx`:
   - Returns the buffer with headers:
     - `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
     - `Content-Disposition: attachment; filename="Learning_Objectives_[courseName].docx"`
7. For `format=pdf`:
   - Write the .docx buffer to a temp file
   - Convert to PDF using LibreOffice: `soffice --headless --convert-to pdf [tempfile]`
   - If LibreOffice is not available, fall back to returning the .docx with a toast message explaining PDF requires LibreOffice
   - Return the PDF buffer with headers:
     - `Content-Type: application/pdf`
     - `Content-Disposition: attachment; filename="Learning_Objectives_[courseName].pdf"`
8. Use try/catch with `errorResponse()` for all error paths

**Important:** Check how the existing storyboard export route (`app/api/pages/[pageId]/export/route.ts`) handles auth and response headers. Match that pattern.

### Part C: Wire Screen 6 Buttons

In the Screen 6 component:

1. Find the "Export to Word" button and wire its onClick to:
   ```typescript
   const handleExportDocx = async () => {
     try {
       setExporting('docx');
       const response = await fetch(
         `/api/courses/${courseId}/objectives/export?format=docx`
       );
       if (!response.ok) throw new Error('Export failed');
       const blob = await response.blob();
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = `Learning_Objectives_${courseName}.docx`;
       a.click();
       URL.revokeObjectURL(url);
     } catch (err) {
       console.error('Export error:', err);
       // Show error toast if toast system exists
     } finally {
       setExporting(null);
     }
   };
   ```

2. Wire the "Export to PDF" button with the same pattern but `?format=pdf` and `.pdf` extension

3. Add loading state: while exporting, show a spinner or "Exporting..." text on the button and disable it

4. If the buttons are currently in a different component or passed as props, trace the chain and wire at the correct level

## PDF Conversion Note

PDF conversion via LibreOffice may not be available in all dev environments. The implementation should:
- Attempt LibreOffice conversion first
- If it fails (command not found), return a JSON error with `{ error: 'PDF export requires LibreOffice. Word export is available.', fallback: 'docx' }`
- The UI should catch this and offer the .docx download instead with a message

For dev environments on Windows with Docker: LibreOffice runs inside the Docker container. The API route may need to detect the environment. For now, implement the LibreOffice path and add a comment noting the Windows/Docker consideration.

## Testing

After implementation:

1. Navigate to a course with objectives data
2. Go to Objectives Wizard → Screen 6
3. Click "Export to Word" → should download a .docx file
4. Open in Word or Google Docs → verify:
   - Title page renders with course name and date
   - Summary section shows correct counts and Bloom distribution
   - Objectives grouped by parent task
   - Orphan section appears if applicable
   - ABCD fields populated in each objective card
   - Triage appendix shows all tasks
5. Click "Export to PDF" → should download .pdf (or gracefully fall back to .docx with message)
6. Test with a course that has NO objectives → should produce a document with "No objectives have been created yet" message
7. Test with objectives that have NO parent tasks → all should appear under "Unlinked Objectives"

Run `npm run build` after all changes.

## Files to Create/Modify

- **Create:** `lib/export/objectives-to-docx.ts`
- **Create:** `app/api/courses/[courseId]/objectives/export/route.ts`
- **Modify:** Screen 6 component (wire button handlers)

## Do Not

- Do not modify the Prisma schema
- Do not change any other Screen components (1-5)
- Do not add new npm packages (docx is already installed)
- Do not use unicode bullets — use LevelFormat.BULLET
- Do not use WidthType.PERCENTAGE in tables — use WidthType.DXA
- Do not use `\n` for line breaks — use separate Paragraph elements
