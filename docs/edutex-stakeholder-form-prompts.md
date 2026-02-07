# EDUTex Stakeholder Form UI — Claude Code Prompts

Use these prompts sequentially in Cursor. Each phase builds on the previous one and produces something testable. Feed one phase at a time — confirm it works before moving to the next.

Reference docs (should be in your `docs/` folder):
- `edutex-stakeholder-form-ui-spec.md` — full component spec
- `edutex-stakeholder-needs-analysis-questions.md` — question content spec
- `edutex-stakeholder-data-model.md` — data model rationale
- `edutex-stakeholder-api-routes.md` — API route spec

---

## Phase 1: Page Shell + Token Validation

```
Build the stakeholder form page shell for EDUTex. This is a public-facing form that stakeholders access via a token link — no login, no app chrome.

Reference: docs/edutex-stakeholder-form-ui-spec.md (full spec)
Reference: docs/edutex-stakeholder-api-routes.md (API shapes)

Create these files:

1. app/stakeholder/form/layout.tsx
   - Minimal layout with NO sidebar, NO header nav, NO auth
   - Do NOT inherit from the main app layout
   - Centered container, max-width ~768px
   - Clean white/light background
   - Small EDUTex branding text (not the full logo) at top
   - "Powered by EDUTex" footer text, muted

2. app/stakeholder/form/[token]/page.tsx
   - Client component (needs state management)
   - On mount, fetch GET /api/stakeholder/form/[token] using the token from params
   - Handle three initial states:
     a) Loading — show a skeleton/spinner
     b) Invalid token (404, inactive, or expired) — show message: "This link is no longer active. Please contact the person who sent it for a new link."
     c) Valid token — for now, just render the token info and training type as placeholder text. We'll add the form in later phases.
   - Use try/catch on the fetch — network errors should show a generic error state, not crash

The existing API route at app/api/stakeholder/form/[token]/route.ts handles the GET request and returns:
{
  token: { id, projectId, trainingType, isActive, expiresAt, stakeholderName, stakeholderEmail },
  submission: { id, status, revisionNotes, responses: [{ questionId, value, updatedAt }] } | null,
  project: { name }
}

Do NOT touch any existing files. This is new code only.

After creating these files, I should be able to:
- Visit /stakeholder/form/[valid-token] and see the loading state, then the project name and training type
- Visit /stakeholder/form/garbage-token and see the invalid token message
```

---

## Phase 2: Attribution Modal

```
Add the attribution modal to the stakeholder form page.

Reference: docs/edutex-stakeholder-form-ui-spec.md — see "AttributionModal" component section

Create: components/stakeholder/AttributionModal.tsx

Behavior:
- Modal overlay that appears when the page loads AND token.stakeholderName is null (first visit)
- Two fields: Name (required text input), Email (optional text input)
- Context text: "Please enter your name so we can attribute your responses. This helps the instructional designer track feedback from multiple contributors."
- Confirm button — disabled until name is non-empty
- NOT dismissible by clicking outside or pressing Escape (name is required to proceed)
- On confirm: call POST /api/stakeholder/form/[token]/identify with { name, email }
  - API request shape: { name: string; email?: string }
  - API response shape: { submission: { id: string; status: 'DRAFT' } }
- On success: close modal, store the attribution name in parent state, update submission state with the returned submission
- On error: show inline error message in the modal, don't close

Update: app/stakeholder/form/[token]/page.tsx
- Add state for attributionName (string | null)
- If token is valid but stakeholderName is null AND attributionName is null → show modal
- If token already has stakeholderName (returning user) → set attributionName from token data, skip modal
- After modal confirms → set attributionName, hide modal
- For now, once the modal is resolved, show a placeholder message like "Form ready for [name]"

Design:
- Use existing Tailwind classes — match the clean/minimal feel of the layout
- Modal should be centered vertically and horizontally
- Semi-transparent dark backdrop
- White modal card, rounded corners, padding
- Don't overcomplicate it — this is a 10-second interaction

Test:
- First visit (no stakeholderName on token) → modal appears
- Enter name + confirm → modal closes, page shows "Form ready for [name]"
- Reload page → modal should NOT appear again (token now has stakeholderName from the identify call)
```

---

## Phase 3: Question Rendering

```
Add question rendering to the stakeholder form. This is the core of the form — displaying the right questions based on training type with proper field types and conditional visibility.

Reference: docs/edutex-stakeholder-form-ui-spec.md — see FormSectionRenderer and QuestionField sections
Reference: docs/edutex-stakeholder-needs-analysis-questions.md — full question content

IMPORTANT: Questions are CODE CONSTANTS imported from lib/questions/. Do NOT fetch them from an API. Use getQuestionsForType(trainingType) to get the combined shared + type-specific array.

IMPORTANT: Do NOT render idNotes or idNotesExtended on this page. Those are for the ID review UI only. The stakeholder form shows: questionText + stakeholderGuidance.

Create these files:

1. components/stakeholder/FormSectionRenderer.tsx
   - Receives: questions array (from getQuestionsForType), responses map (Map<string, string>), onChange callback
   - Groups questions by their `section` field
   - Renders section headers with visual dividers between sections
   - For each question, checks conditional visibility before rendering:
     - If question.conditionalOn is null → always visible
     - If question.conditionalOn exists → evaluate against current responses map
     - Operators to support: 'equals', 'not_equals', 'contains', 'not_empty'
   - Passes each visible question to QuestionField

2. components/stakeholder/QuestionField.tsx
   - Receives: question (QuestionDefinition), value (string), onChange callback
   - Renders based on question.fieldType:
     - SHORT_TEXT → <input type="text">
     - LONG_TEXT → <textarea> with reasonable min-height (4-5 rows)
     - SINGLE_SELECT → radio group if ≤5 options, <select> dropdown if more
     - MULTI_SELECT → checkbox group (store as comma-separated string in value)
     - DATE → <input type="date">
     - NUMBER → <input type="number">
     - SCALE → horizontal radio row with labeled endpoints
   - Shows question.questionText as the label
   - Shows question.stakeholderGuidance as help text below the input:
     - If guidance is short (< 200 chars) → always visible, muted text
     - If guidance is long (≥ 200 chars) → collapsible with "Show examples" / "Hide examples" toggle
   - Shows required indicator on required questions (red asterisk or "(required)" text)
   - No validation errors during editing — validation only fires on submit (Phase 5)

Update: app/stakeholder/form/[token]/page.tsx
   - Add responses state: Map<string, string> (or Record<string, string>)
   - Import getQuestionsForType from lib/questions/
   - After attribution is resolved (State 4), render FormSectionRenderer with:
     - questions from getQuestionsForType(token.trainingType)
     - responses map (initialize from submission.responses if returning to a draft)
     - onChange handler that updates the responses map
   - Show the project name as a header above the form: "Needs Analysis: [project.name]"
   - Show the training type as a subtitle (formatted nicely, not the enum value)

Test:
- Load a form with training type PERFORMANCE_PROBLEM → should see 11 shared + 6 performance questions (17 total)
- Load a form with training type NEW_SYSTEM → should see 11 shared + 9 system questions (20 total)
- Conditional questions: SHARED_04 should only appear when SHARED_03 equals "Other" (or however that conditional is defined). Test by selecting/deselecting the trigger value.
- Field types: verify text inputs, textareas, radio groups, selects all render correctly
- Stakeholder guidance: short guidance visible inline, long guidance collapsed with toggle
```

---

## Phase 4: Autosave

```
Add autosave functionality to the stakeholder form. Every field change should be saved automatically after a debounce period.

Reference: docs/edutex-stakeholder-form-ui-spec.md — see AutosaveManager section

Create these files:

1. hooks/useAutosave.ts
   - Custom hook that manages debounced saving
   - Accepts: token (string), responses (Map or Record), attributionName (string), dependencies
   - Tracks which questionIds have changed since last save (dirty tracking)
   - On change: start/reset a 2-second debounce timer
   - When timer fires: call PUT /api/stakeholder/form/[token]/responses with:
     {
       responses: [{ questionId: string, value: string }, ...],  // only changed fields
       updatedBy: attributionName
     }
   - Returns: saveStatus ('idle' | 'saving' | 'saved' | 'error'), lastSavedAt (Date | null)
   - On save failure: retry once after 3 seconds. If retry fails, set status to 'error'.
   - On save success: clear dirty tracking, set status to 'saved'
   - Do NOT save if no fields are dirty

2. components/stakeholder/AutosaveIndicator.tsx
   - Receives: saveStatus, lastSavedAt
   - Renders a small, unobtrusive status line:
     - 'idle' → nothing (or very faint "Changes will be saved automatically")
     - 'saving' → "Saving..." with a subtle spinner/animation
     - 'saved' → "All changes saved" with relative timestamp (e.g., "just now", "30 seconds ago")
     - 'error' → "Unable to save" in red/amber with a "Try again" button
   - Position: sticky at the top of the form area or fixed at the bottom — pick whichever feels less intrusive
   - Transitions between states should be smooth (fade, not jarring)

Update: app/stakeholder/form/[token]/page.tsx
   - Wire up useAutosave hook with the responses state and attributionName
   - Place AutosaveIndicator in the form layout
   - When responses are pre-populated from an existing DRAFT submission, those initial values should NOT trigger a save (they aren't "changes")

Update: components/stakeholder/QuestionField.tsx (if needed)
   - Ensure onChange fires with the questionId and new value on every input change
   - For MULTI_SELECT checkboxes: compute the comma-separated value and fire onChange with the full string

Test:
- Edit a text field → wait 2 seconds → should see "Saving..." then "All changes saved"
- Edit multiple fields quickly → should batch into one save call
- Reload the page → previously saved values should be pre-populated
- Disconnect network (or use browser DevTools to block the API) → should see "Unable to save" error state
```

---

## Phase 5: Submit + Validation

```
Add submit functionality with required-field validation to the stakeholder form.

Reference: docs/edutex-stakeholder-form-ui-spec.md — see SubmitSection section

Create: components/stakeholder/SubmitSection.tsx

Behavior:
- Renders at the bottom of the form after all question sections
- Contains a "Submit" button (prominent, primary color)

Validation (runs when Submit is clicked):
- Get all questions from the current form (getQuestionsForType)
- Filter to only VISIBLE questions (use the same conditional visibility check from FormSectionRenderer)
- Filter to only REQUIRED questions (question.required === true)
- Check that each required+visible question has a non-empty response
- If validation FAILS:
  - Show inline error on each missing field: "This field is required" in red below the input
  - Show summary text near the submit button: "Please complete X required fields before submitting"
  - Scroll to the first missing field smoothly
  - Do NOT call the API
- If validation PASSES:
  - Show a confirmation dialog/modal: "Once submitted, you won't be able to edit your responses unless the instructional designer requests a revision. Ready to submit?"
  - Two buttons: "Go Back" (cancel) and "Submit" (confirm)
  - On confirm: call POST /api/stakeholder/form/[token]/submit
    - Request body is empty — the server validates
    - Success response: { status: 'SUBMITTED', submittedAt: string }
    - Failure response: { error: 'MISSING_REQUIRED', missingFields: string[] } — handle as validation error
  - On success: transition to Thank You state

Create: components/stakeholder/ThankYouView.tsx
- Simple, clean completion state
- Success checkmark icon (use a simple SVG or Unicode ✓)
- Heading: "Thank you for your input!"
- Body: "Your responses have been submitted and the instructional designer will review them. If follow-up is needed, they'll reach out directly."
- No form, no edit capability
- Optional later: expandable read-only summary of submitted responses

Update: app/stakeholder/form/[token]/page.tsx
- Add submitStatus state
- After successful submit, switch to rendering ThankYouView
- If the page loads with submission.status === 'SUBMITTED' or 'UNDER_REVIEW' or 'APPROVED', render ThankYouView immediately

Update: components/stakeholder/QuestionField.tsx
- Add optional error prop (string | null)
- When error is set, show it in red below the input and add a red border to the input
- Error clears when the field value changes

Test:
- Leave a required field empty → click Submit → should see inline errors and scroll to first one
- Fill all required fields → click Submit → confirmation dialog appears
- Confirm → "Saving..." → Thank You view
- Reload → Thank You view persists (submission is now SUBMITTED)
- Fill in optional conditional question that is hidden → make it visible → should still pass validation if not required
```

---

## Phase 6: Revision Flow

```
Add the revision flow to the stakeholder form. When an instructional designer requests a revision, the stakeholder should see what was asked and be able to edit and resubmit.

Reference: docs/edutex-stakeholder-form-ui-spec.md — see RevisionBanner section

Create: components/stakeholder/RevisionBanner.tsx
- Receives: revisionNotes (string)
- Renders at the TOP of the form, before any question sections
- Yellow/amber background with a border
- Icon or heading: "Revision Requested"
- Body: the revisionNotes text from the submission
- Instruction: "Please review and update your responses based on the feedback above, then resubmit."
- Should be visually prominent but not alarming

Update: app/stakeholder/form/[token]/page.tsx
- When submission.status === 'REVISION_REQUESTED':
  - Render RevisionBanner with submission.revisionNotes
  - Pre-fill all responses from submission.responses (same as returning to a DRAFT)
  - Enable autosave (same as active form)
  - Enable submit button (same as active form — the POST /submit endpoint handles re-submission)
- The rest of the form behaves identically to the DRAFT state

Update: components/stakeholder/SubmitSection.tsx
- Change button text to "Resubmit" when the current status is REVISION_REQUESTED
- Confirmation text adjusts: "Your updated responses will be sent back to the instructional designer for review."

Test:
- Using your API client (Postman, curl, or a test script), set a submission to REVISION_REQUESTED with revisionNotes:
  POST /api/stakeholder/submissions/[submissionId]/request-revision
  Body: { notes: "Please clarify question 7 — we need specific KPI numbers, not just 'improved performance'." }
- Load the form → should see the yellow revision banner with that note
- Responses should be pre-filled from previous submission
- Edit a field → autosave works
- Click Resubmit → confirmation → Thank You view
```

---

## Phase 7: Polish

```
Polish the stakeholder form for production readiness.

1. Auto-resize textareas
   - LONG_TEXT textareas should grow vertically as the user types
   - Use a useEffect or onInput handler that sets height to scrollHeight
   - Set a reasonable min-height (4 rows) and max-height (16 rows, then scroll)
   - Apply to all LONG_TEXT QuestionField instances

2. Mobile responsiveness
   - Test at 375px width (iPhone SE) and 768px (tablet)
   - Radio groups should stack vertically on small screens
   - The attribution modal should be full-width on mobile with proper padding
   - Form container should have horizontal padding on mobile (16-20px)
   - Submit button should be full-width on mobile

3. Keyboard navigation
   - Tab order should follow question display order
   - Enter key in the attribution modal should trigger confirm (if name is filled)
   - Escape should NOT close the attribution modal (it's required)
   - Focus should move to the first question field after the modal closes

4. Loading skeletons
   - Replace the initial loading spinner with skeleton pulse animations
   - Skeleton shapes should approximate the form layout: header block, section dividers, input-sized rectangles

5. Error boundary
   - Wrap the form in an error boundary component
   - On crash: show a friendly message like "Something went wrong. Please try refreshing the page."
   - Log the error to console (we don't have error reporting infrastructure yet)

6. Form header refinement
   - Show project name prominently
   - Show training type as a formatted label (e.g., "New System / Software Deployment" not "NEW_SYSTEM")
   - Show a brief intro paragraph: "This form helps the instructional design team understand your training needs. Your responses will be used to shape the analysis and design of the training program."

Test all of the above on both desktop and a mobile viewport.
```

---

## Verification Checklist

After all phases are complete, walk through this end-to-end:

- [ ] Visit /stakeholder/form/bad-token → invalid token message
- [ ] Visit /stakeholder/form/[valid-token] (first time) → attribution modal appears
- [ ] Enter name → modal closes → form renders with correct questions for training type
- [ ] Questions grouped by section with headers
- [ ] Conditional questions show/hide based on answers
- [ ] Stakeholder guidance text visible (short inline, long collapsible)
- [ ] ID notes NOT visible anywhere on the page
- [ ] Edit a field → autosave fires after 2 seconds → "All changes saved"
- [ ] Reload → values persisted, no modal (returning user)
- [ ] Leave required field empty → Submit → inline errors, scroll to first
- [ ] Fill all required → Submit → confirmation → Thank You
- [ ] Reload → Thank You persists
- [ ] Set submission to REVISION_REQUESTED via API → reload form → revision banner with notes
- [ ] Edit field → Resubmit → confirmation → Thank You
- [ ] Test on mobile viewport → everything readable and tappable
- [ ] Tab through the form → logical order
