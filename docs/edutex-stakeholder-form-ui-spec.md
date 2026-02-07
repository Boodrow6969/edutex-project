# EDUTex Stakeholder Needs Analysis — Step 4: Form UI Implementation Spec

## Overview

Build the public-facing stakeholder form at `/stakeholder/form/[token]`. This page lives outside the app shell — no sidebar, no auth, no navigation. A stakeholder receives a link, opens it, identifies themselves, answers questions filtered by training type, and submits. The ID reviews it later (Step 5).

---

## What's Already Built (Steps 1-3)

### Prisma Models (migrated, in dev DB)
- `StakeholderAccessToken` — token, projectId, trainingType, createdBy, expiresAt, isActive, stakeholderName, stakeholderEmail
- `StakeholderSubmission` — tokenId, projectId, trainingType, status (DRAFT | SUBMITTED | UNDER_REVIEW | APPROVED | REVISION_REQUESTED), submittedAt, reviewedAt, reviewedBy, revisionNotes
- `StakeholderResponse` — submissionId, questionId (e.g. "SHARED_07"), value, updatedAt, updatedBy
- `StakeholderChangeLog` — submissionId, questionId, changedBy, previousValue, newValue, changedAt

### TypeScript Types
- `lib/types/stakeholderAnalysis.ts` — enums: TrainingType, SubmissionStatus, FieldType
- `lib/types/questionDefinition.ts` — interfaces: QuestionDefinition, ConditionalRule

### Question Constants (39 questions, 5 files)
- `lib/questions/shared.ts` — 11 shared questions (ALL types)
- `lib/questions/performance.ts` — 6 performance-problem questions
- `lib/questions/newSystem.ts` — 9 new-system questions
- `lib/questions/compliance.ts` — 7 compliance questions
- `lib/questions/roleChange.ts` — 6 role-change questions
- Barrel export: `getQuestionsForType(trainingType)` returns the combined shared + type-specific array
- `QUESTION_MAP` — lookup by questionId
- `ALL_QUESTIONS` — flat array of all 39
- 10 questions have `idNotesExtended` (deeper coaching content, app-only)

### API Routes (11 endpoints in `app/api/stakeholder/`)

**Token management (session-auth, ID-facing):**
- `POST /api/stakeholder/tokens` — create token for a project
- `GET /api/stakeholder/tokens?projectId=X` — list tokens for a project
- `PATCH /api/stakeholder/tokens/[tokenId]` — deactivate/update token

**Form endpoints (token-auth, stakeholder-facing):**
- `GET /api/stakeholder/form/[token]` — load form data (token info, submission if exists, saved responses)
- `POST /api/stakeholder/form/[token]/identify` — set stakeholder name/email on token + create submission if none exists
- `PUT /api/stakeholder/form/[token]/responses` — save one or more responses (autosave target)
- `POST /api/stakeholder/form/[token]/submit` — final submission (validates required fields, sets status to SUBMITTED)

**Review endpoints (session-auth, ID-facing):**
- `GET /api/stakeholder/submissions?projectId=X` — list submissions for a project
- `GET /api/stakeholder/submissions/[submissionId]` — full submission detail with all responses
- `POST /api/stakeholder/submissions/[submissionId]/approve` — approve submission
- `POST /api/stakeholder/submissions/[submissionId]/request-revision` — send back with notes

---

## Page Architecture

### Route
```
app/stakeholder/form/[token]/page.tsx
```

This is a **public route** — no auth middleware, no layout inheritance from the main app. The `[token]` param drives everything.

### Layout
```
app/stakeholder/form/layout.tsx
```

Minimal layout — no sidebar, no header nav. Just a clean wrapper:
- EDUTex branding (small logo, muted)
- White/light background
- Max-width container (~768px) centered
- Footer with "Powered by EDUTex" or similar

---

## Page States

The page has five distinct states, driven by the API response from `GET /api/stakeholder/form/[token]`:

### State 1: Loading
- Skeleton or spinner while the initial fetch completes

### State 2: Invalid/Expired Token
- Token not found, deactivated, or expired
- Message: "This link is no longer active. Please contact the person who sent it for a new link."
- No form rendered

### State 3: Attribution Required (First Visit)
- Token valid, no submission exists yet (or submission exists but no stakeholderName on token)
- Show **Attribution Modal** (see component spec below)
- Form is visible but disabled/blurred behind the modal

### State 4: Active Form
- Token valid, stakeholder identified, submission in DRAFT status
- Full form rendered with autosave
- Submit button at bottom

### State 4b: Revision Requested
- Same as State 4, but submission status is REVISION_REQUESTED
- **Revision banner** at top showing the ID's notes
- All previous responses pre-filled and editable
- Submit button re-enabled

### State 5: Submitted / Thank You
- Submission status is SUBMITTED, UNDER_REVIEW, or APPROVED
- Read-only view of responses (or just a thank-you message)
- Message: "Your responses have been submitted. The instructional designer will review them and may reach out with follow-up questions."

---

## Component Breakdown

### 1. StakeholderFormPage (page.tsx)
**Responsibilities:**
- Fetch form data via `GET /api/stakeholder/form/[token]`
- Determine page state from response
- Render appropriate state component
- Hold top-level state: submission, responses map, attribution name, save status

**State shape:**
```typescript
interface FormPageState {
  loading: boolean;
  error: string | null;
  token: TokenInfo | null;           // from API
  submission: SubmissionInfo | null;  // from API
  responses: Map<string, string>;    // questionId → value (local working copy)
  questions: QuestionDefinition[];   // from getQuestionsForType()
  attributionName: string | null;    // set after modal
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  submitStatus: 'idle' | 'submitting' | 'submitted' | 'error';
}
```

### 2. AttributionModal
**Trigger:** Opens automatically when page loads in State 3 (no stakeholder name on token)

**Fields:**
- Name (required) — text input
- Email (optional) — text input
- Brief context line: "Please enter your name so we can attribute your responses. This helps the instructional designer track feedback from multiple contributors."

**On confirm:**
1. Call `POST /api/stakeholder/form/[token]/identify` with name + email
2. Store name in component state (used for change log attribution)
3. If no submission existed, API creates one — update local submission state
4. Close modal, enable form

**Design notes:**
- Modal overlay, not dismissible by clicking outside (name is required to proceed)
- Clean, simple — don't make it feel like a login wall
- If the token already has a stakeholder name (returning user), skip the modal and pre-populate the attribution name from the token

### 3. RevisionBanner
**Renders when:** submission.status === 'REVISION_REQUESTED'

**Content:**
- Yellow/amber banner at top of form
- Heading: "Revision Requested"
- Body: submission.revisionNotes (the ID's feedback)
- Instruction: "Please review and update your responses, then resubmit."

### 4. FormSectionRenderer
**Responsibilities:**
- Receives the filtered question array (shared + type-specific)
- Groups questions by `section` field
- Renders section headers with dividers
- Handles conditional visibility logic

**Section rendering order:**
1. "Project Context" (shared questions about the project)
2. "Audience & Environment" (shared questions about learners)
3. "Goals & Success Criteria" (shared questions about outcomes)
4. Type-specific section (e.g., "Performance Analysis" or "System Deployment Details")
5. "Stakeholders & Resources" (shared wrap-up questions)

**Conditional visibility:**
```typescript
function isQuestionVisible(question: QuestionDefinition, responses: Map<string, string>): boolean {
  if (!question.conditionalOn) return true;
  
  const { questionId, operator, value } = question.conditionalOn;
  const currentValue = responses.get(questionId);
  
  switch (operator) {
    case 'equals': return currentValue === value;
    case 'not_equals': return currentValue !== value;
    case 'contains': return currentValue?.includes(value) ?? false;
    case 'not_empty': return !!currentValue && currentValue.trim() !== '';
    default: return true;
  }
}
```

### 5. QuestionField
**Responsibilities:**
- Renders a single question based on its `fieldType`
- Shows question text + stakeholder guidance (expandable or always-visible)
- Does NOT show ID notes (those are app-only)
- Tracks local value, triggers autosave on change

**Field type → component mapping:**
| FieldType | Component | Notes |
|-----------|-----------|-------|
| SHORT_TEXT | `<input type="text">` | Single line |
| LONG_TEXT | `<textarea>` | Auto-resize preferred (ENH-006 pattern) |
| SINGLE_SELECT | `<select>` or radio group | Radio for ≤5 options, select for more |
| MULTI_SELECT | Checkbox group | Each option as checkbox |
| DATE | `<input type="date">` | Native date picker |
| NUMBER | `<input type="number">` | With min/max if specified |
| SCALE | Likert-style radio row | 1-5 or 1-7 with labeled endpoints |

**Stakeholder guidance display:**
- Show as help text below the question
- Collapsible if long (click "Show examples" to expand)
- Lighter text color to differentiate from the question itself

**Required indicator:**
- Red asterisk or "(required)" label on required questions
- Visual-only during editing — validation fires on submit

### 6. AutosaveManager
**Pattern:** Debounced save on field change

**Flow:**
1. User edits a field → update local `responses` map immediately (responsive UI)
2. Start/reset a debounce timer (1.5-2 seconds)
3. When timer fires, call `PUT /api/stakeholder/form/[token]/responses` with changed responses
4. Include `updatedBy: attributionName` in the request body (feeds change log)
5. Update `saveStatus` state: saving → saved (or error)

**Save indicator:**
- Small text near the top or bottom of the form
- States: "All changes saved" (with timestamp) | "Saving..." | "Unable to save — retrying..."
- Use a subtle animation/fade for transitions

**Batch saves:**
- If multiple fields change within the debounce window, batch them into one API call
- The `PUT /responses` endpoint accepts an array of `{ questionId, value }` pairs

**Error handling:**
- On save failure, retry once after 3 seconds
- If retry fails, show persistent error message with "Try again" button
- Don't lose local state — responses map stays in memory regardless of save status

### 7. SubmitSection
**Renders at the bottom of the form**

**Pre-submit validation:**
1. Check all questions where `required: true` AND `isQuestionVisible() === true` have non-empty responses
2. If validation fails:
   - Scroll to the first missing required field
   - Show inline error message on each missing field: "This field is required"
   - Show summary at submit button: "Please complete all required fields before submitting"
3. If validation passes:
   - Show confirmation: "Once submitted, you won't be able to edit your responses unless the instructional designer requests a revision. Ready to submit?"
   - On confirm: call `POST /api/stakeholder/form/[token]/submit`
   - On success: transition to State 5 (Thank You)

### 8. ThankYouView
**Renders when:** submission is submitted/approved

**Content:**
- Success icon/illustration
- Heading: "Thank you for your input!"
- Body: "Your responses have been submitted and the instructional designer will review them. If follow-up is needed, they'll reach out directly."
- Optional: read-only summary of what was submitted (expandable)

---

## Data Flow Summary

```
Page Load
  └─ GET /api/stakeholder/form/[token]
       ├─ 404/inactive → State 2 (Invalid)
       ├─ No stakeholder name → State 3 (Attribution Modal)
       │    └─ POST /identify → creates submission → State 4
       ├─ REVISION_REQUESTED → State 4b (with RevisionBanner)
       ├─ DRAFT → State 4 (Active Form)
       └─ SUBMITTED/APPROVED → State 5 (Thank You)

During Editing (State 4/4b)
  └─ Field change → local state update → debounce → PUT /responses
       └─ Includes updatedBy for change log

On Submit
  └─ Client-side validation
       ├─ Fail → scroll to errors
       └─ Pass → POST /submit → State 5
```

---

## Implementation Order

Build in this sequence — each step produces something testable:

### Phase 1: Page Shell + Token Validation
1. Create route `app/stakeholder/form/[token]/page.tsx`
2. Create layout `app/stakeholder/form/layout.tsx` (minimal, no app chrome)
3. Fetch token data on load
4. Render State 1 (Loading) and State 2 (Invalid Token)
5. **Test:** Visit with a valid token → loading → form area. Visit with garbage token → error message.

### Phase 2: Attribution Modal
6. Build AttributionModal component
7. Wire to `POST /identify` endpoint
8. Handle returning users (name already on token → skip modal)
9. **Test:** First visit shows modal. Enter name → modal closes. Reload → no modal.

### Phase 3: Question Rendering
10. Import `getQuestionsForType()` with the submission's training type
11. Build FormSectionRenderer — group by section, render headers
12. Build QuestionField — map each fieldType to the right input
13. Show stakeholder guidance text
14. Implement conditional visibility
15. **Test:** Different training types show different question sets. Conditional questions appear/disappear.

### Phase 4: Autosave
16. Build autosave hook (useAutosave or similar)
17. Wire to `PUT /responses` endpoint
18. Build save status indicator
19. Pre-populate fields from existing responses (returning to a DRAFT form)
20. **Test:** Edit a field → "Saving..." → "Saved". Reload → values persist.

### Phase 5: Submit + Validation
21. Build required-field validation logic (only visible + required questions)
22. Build SubmitSection with confirmation dialog
23. Wire to `POST /submit` endpoint
24. Transition to State 5 on success
25. **Test:** Leave required field empty → error on submit. Fill all → confirm → thank you.

### Phase 6: Revision Flow
26. Build RevisionBanner component
27. Pre-fill responses for REVISION_REQUESTED submissions
28. Re-enable submit for revised submissions
29. **Test:** Use API to set a submission to REVISION_REQUESTED with notes → form shows banner + editable fields.

### Phase 7: Polish
30. Auto-resize textareas
31. Keyboard navigation / tab order
32. Mobile responsiveness (form should work well on tablet/phone)
33. Loading skeletons for initial fetch
34. Error boundary for unexpected failures

---

## API Request/Response Shapes (Quick Reference)

### GET /api/stakeholder/form/[token]
```typescript
// Response
{
  token: {
    id: string;
    projectId: string;
    trainingType: TrainingType;
    isActive: boolean;
    expiresAt: string | null;
    stakeholderName: string | null;
    stakeholderEmail: string | null;
  };
  submission: {
    id: string;
    status: SubmissionStatus;
    revisionNotes: string | null;
    responses: { questionId: string; value: string; updatedAt: string }[];
  } | null;
  project: {
    name: string;  // displayed in form header for context
  };
}
```

### POST /api/stakeholder/form/[token]/identify
```typescript
// Request
{ name: string; email?: string }
// Response
{ submission: { id: string; status: 'DRAFT' } }
```

### PUT /api/stakeholder/form/[token]/responses
```typescript
// Request
{
  responses: { questionId: string; value: string }[];
  updatedBy: string;  // attribution name
}
// Response
{ saved: number; updatedAt: string }
```

### POST /api/stakeholder/form/[token]/submit
```typescript
// Request — empty body (server validates)
// Response (success)
{ status: 'SUBMITTED'; submittedAt: string }
// Response (validation fail)
{ error: 'MISSING_REQUIRED'; missingFields: string[] }
```

---

## Design Decisions Already Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Attribution approach | Modal on first edit (Option 3) | Balance between tracking and friction — no account required |
| Question layers on form | Question text + stakeholder guidance only | ID notes stay in the app; stakeholders don't see coaching content |
| Autosave vs. manual save | Autosave with debounce | Stakeholders shouldn't worry about losing work |
| Conditional questions | Client-side show/hide | Questions are code-defined constants, not dynamic — no API call needed |
| Form validation | Client-side on submit, server-side backup | Immediate feedback for stakeholders, server validates required fields too |
| Thank-you vs. read-only | Thank-you message (read-only view optional) | Keep it simple; read-only view can be added later if stakeholders ask for it |

---

## Files to Create

```
app/
  stakeholder/
    form/
      layout.tsx                    — minimal public layout
      [token]/
        page.tsx                    — main page component, state machine
components/
  stakeholder/
    AttributionModal.tsx            — name/email prompt
    RevisionBanner.tsx              — revision notes display
    FormSectionRenderer.tsx         — section grouping + conditional logic
    QuestionField.tsx               — field type → input mapping
    AutosaveIndicator.tsx           — save status display
    SubmitSection.tsx               — validation + submit button
    ThankYouView.tsx                — post-submission state
hooks/
  useStakeholderForm.ts             — main form state + data fetching hook
  useAutosave.ts                    — debounced save logic
```

---

## Notes for Claude Code

- Questions are **code constants**, not database rows. Import from `lib/questions/` — don't fetch them from an API.
- The form uses **token auth**, not session auth. The `[token]` URL param IS the auth. API routes for stakeholder form endpoints validate the token, not a session cookie.
- `idNotes` and `idNotesExtended` must NEVER render on this page. They're for the ID review UI (Step 5).
- The `updatedBy` field on responses comes from the attribution modal name, not from a session. Store it in React state after the modal confirms.
- The change log is written server-side by the `PUT /responses` endpoint. The client just sends `updatedBy` — the API compares previous vs. new values and writes log entries.
- This page should work without JavaScript hydration issues — consider whether it needs to be a client component from the start or if parts can be server-rendered.
