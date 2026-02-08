# EDUTex Stakeholder Needs Analysis — API Routes

> **Migration Note (2026-02-08):** The `Project` model was renamed to `Course`. Stakeholder models now use `workspaceId` (migrated from `projectId`). References to `projectId` in query params and request bodies below reflect the original spec; the live API uses `courseId` or `workspaceId` as appropriate.

## Overview

This document defines all API routes for the stakeholder needs analysis feature. Three groups:

1. **Token routes** — ID-facing, authenticated. Create and manage shareable links.
2. **Form routes** — Stakeholder-facing, token-authenticated (no login required). Load form, save answers, submit.
3. **Review routes** — ID-facing, authenticated. List submissions, review, approve, request revision.

---

## Route Map

```
/api/stakeholder/
├── tokens/
│   ├── POST   /                    → Create token (ID creates shareable link)
│   ├── GET    /?projectId=xxx      → List tokens for a project
│   └── PATCH  /[tokenId]           → Deactivate or update a token
│
├── form/
│   ├── GET    /[token]             → Load form (questions + any saved responses)
│   ├── POST   /[token]/identify    → Set stakeholder name/email (attribution modal)
│   ├── PUT    /[token]/responses   → Save responses (autosave, with change log)
│   └── POST   /[token]/submit      → Submit the form
│
└── submissions/
    ├── GET    /?projectId=xxx      → List submissions for a project
    ├── GET    /[submissionId]      → Full submission with responses + change log
    ├── POST   /[submissionId]/approve          → Approve submission
    └── POST   /[submissionId]/request-revision → Send back with notes
```

---

## Group 1: Token Routes (ID-Facing)

All token routes require authentication (current user session). The user must be a member of the workspace that owns the project.

### POST /api/stakeholder/tokens

Create a new access token for a project. This generates the shareable link the ID sends to the stakeholder.

**Request body:**
```typescript
{
  projectId: string;       // Required — which project
  trainingType: TrainingType; // Required — which question set
  expiresAt?: string;      // Optional — ISO date string, null = never expires
}
```

**Logic:**
1. Verify authenticated user
2. Verify user has access to the project's workspace
3. Create `StakeholderAccessToken` with `createdById` = current user
4. Auto-create a `StakeholderSubmission` in DRAFT status linked to this token
   - Denormalize `projectId` and `trainingType` onto the submission
   - This means the submission exists before the stakeholder even opens the form
5. Return the token record including the generated `token` string

**Why create the submission immediately?** So that when the stakeholder starts saving responses, the submission row already exists. No need for a separate "initialize submission" step on first form load. The status stays DRAFT until they explicitly submit.

**Response:**
```typescript
{
  id: string;
  token: string;          // The string for the shareable URL
  projectId: string;
  trainingType: TrainingType;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  submission: {
    id: string;
    status: "DRAFT";
  };
  // Constructed URL for convenience:
  formUrl: string;        // e.g., "/stakeholder/form/cly1abc2def3"
}
```

---

### GET /api/stakeholder/tokens?projectId=xxx

List all tokens for a project. Shows the ID which links have been created, their status, and whether the stakeholder has submitted.

**Query params:**
- `projectId` (required)

**Logic:**
1. Verify authenticated user
2. Verify user has access to the project's workspace
3. Query tokens for this project, include submission status and stakeholder name

**Response:**
```typescript
{
  tokens: {
    id: string;
    token: string;
    trainingType: TrainingType;
    isActive: boolean;
    expiresAt: string | null;
    stakeholderName: string | null;
    stakeholderEmail: string | null;
    createdAt: string;
    submission: {
      id: string;
      status: SubmissionStatus;
      submittedAt: string | null;
      responseCount: number;    // How many questions answered
    } | null;
  }[];
}
```

---

### PATCH /api/stakeholder/tokens/[tokenId]

Update a token — primarily used to deactivate it (revoke access).

**Request body:**
```typescript
{
  isActive?: boolean;      // Set to false to deactivate
  expiresAt?: string | null; // Update expiration
}
```

**Logic:**
1. Verify authenticated user
2. Verify user has access to the token's project workspace
3. Update the token fields

**Response:** Updated token record.

---

## Group 2: Form Routes (Stakeholder-Facing)

Form routes are authenticated by the **token string** in the URL, not by user session. No login required. The token is validated on every request: it must exist, be active, and not be expired.

### GET /api/stakeholder/form/[token]

Load the form. Returns the questions for this training type plus any previously saved responses (for returning to a partially completed form, or for editing after a revision request).

**Logic:**
1. Look up `StakeholderAccessToken` by the `token` param
2. Validate: exists, `isActive === true`, not expired
3. Get the training type from the token
4. Call `getQuestionsForType(trainingType)` to get the question list
5. Load the submission and any existing responses
6. Return questions + responses + submission status

**Response:**
```typescript
{
  // Project context for display
  projectName: string;
  trainingType: TrainingType;
  trainingTypeLabel: string;  // "New System / Software Deployment"

  // Submission state
  submission: {
    id: string;
    status: SubmissionStatus;
    revisionNotes: string | null;  // ID's feedback if revision was requested
  };

  // Attribution state
  stakeholderName: string | null;  // null = attribution modal should show
  stakeholderEmail: string | null;

  // Questions for this training type (shared + type-specific, sorted)
  questions: {
    id: string;
    section: string;
    questionText: string;
    stakeholderGuidance: string;
    fieldType: FieldType;
    required: boolean;
    options?: string[];
    displayOrder: number;
    conditional?: ConditionalRule;
  }[];

  // Existing responses (for resuming or revising)
  responses: Record<string, string>;  // { "SHARED_01": "Salesforce Migration", "SHARED_07": "..." }
}
```

**Note:** The response does NOT include `idNotes` or `idNotesExtended` — those are ID-only fields that never leave the server for stakeholder-facing routes.

---

### POST /api/stakeholder/form/[token]/identify

Set the stakeholder's name and email. Called when the attribution modal is submitted on first form interaction.

**Request body:**
```typescript
{
  name: string;       // Required
  email?: string;     // Optional
}
```

**Logic:**
1. Validate token (exists, active, not expired)
2. Update `StakeholderAccessToken` with `stakeholderName` and `stakeholderEmail`
3. Return success

**Response:**
```typescript
{ success: true; name: string; }
```

---

### PUT /api/stakeholder/form/[token]/responses

Save one or more responses. Called on autosave (debounced) as the stakeholder fills out the form. Also creates change log entries for attribution tracking.

**Request body:**
```typescript
{
  responses: {
    questionId: string;   // e.g., "SHARED_07"
    value: string;        // The answer
  }[];
  changedBy: string;      // From the attribution session (stakeholder's name)
}
```

**Logic:**
1. Validate token (exists, active, not expired)
2. Verify submission exists and status is DRAFT or REVISION_REQUESTED
   - If status is SUBMITTED, UNDER_REVIEW, or APPROVED → reject (403)
3. For each response in the request:
   a. Look up existing response for this `[submissionId, questionId]`
   b. If exists and value changed:
      - Create `StakeholderChangeLog` entry with previous value, new value, changedBy
      - Update `StakeholderResponse` with new value and updatedBy
   c. If not exists:
      - Create `StakeholderResponse`
      - Create `StakeholderChangeLog` with previousValue = null
4. Update submission `updatedAt`

**Response:**
```typescript
{
  saved: number;     // How many responses were saved
  changed: number;   // How many had actual value changes (generated change log entries)
}
```

**Why PUT not PATCH?** This is an idempotent "set these values" operation. Sending the same payload twice produces the same result. The change log only creates entries when the value actually differs from what's stored.

---

### POST /api/stakeholder/form/[token]/submit

Submit the completed form. Changes status from DRAFT to SUBMITTED.

**Logic:**
1. Validate token (exists, active, not expired)
2. Load submission with responses
3. Validate required questions are answered:
   - Get questions for this training type via `getQuestionsForType()`
   - Check that every question where `required === true` has a response with a non-empty value
   - Apply conditional logic: if a required question's condition isn't met (the parent answer doesn't match), skip it
   - Return validation errors if any required questions are missing
4. Update submission status to SUBMITTED, set `submittedAt` to now
5. Deactivate the token (`isActive = false`) — form is no longer editable through the public URL

**Validation error response (400):**
```typescript
{
  error: "MISSING_REQUIRED_RESPONSES";
  missingQuestions: {
    questionId: string;
    questionText: string;
    section: string;
  }[];
}
```

**Success response:**
```typescript
{
  success: true;
  submissionId: string;
  status: "SUBMITTED";
  submittedAt: string;
}
```

**Re-submission after revision:** If the current status is REVISION_REQUESTED, the submit endpoint allows re-submission. Status goes from REVISION_REQUESTED → SUBMITTED. The stakeholder can edit and resubmit as many times as needed until the ID approves.

---

## Group 3: Review Routes (ID-Facing)

All review routes require authentication. The user must be a member of the workspace that owns the project.

### GET /api/stakeholder/submissions?projectId=xxx

List submissions for a project. The ID's "pending review" inbox.

**Query params:**
- `projectId` (required)
- `status` (optional) — filter by status

**Logic:**
1. Verify authenticated user and workspace access
2. Query submissions for this project
3. Include token info (stakeholder name, training type) and response count

**Response:**
```typescript
{
  submissions: {
    id: string;
    trainingType: TrainingType;
    trainingTypeLabel: string;
    status: SubmissionStatus;
    stakeholderName: string | null;
    stakeholderEmail: string | null;
    submittedAt: string | null;
    reviewedAt: string | null;
    responseCount: number;
    totalQuestions: number;  // Total for this training type
    createdAt: string;
  }[];
}
```

---

### GET /api/stakeholder/submissions/[submissionId]

Full submission detail for the ID review screen. Returns every question (with ID notes), every response, and the change log.

**Logic:**
1. Verify authenticated user and workspace access
2. Load submission with all responses and change logs
3. Get questions for this training type (including `idNotes` and `idNotesExtended`)
4. Merge questions with responses — return them together so the review UI can render question + answer + ID coaching in one pass

**Response:**
```typescript
{
  submission: {
    id: string;
    trainingType: TrainingType;
    trainingTypeLabel: string;
    status: SubmissionStatus;
    stakeholderName: string | null;
    stakeholderEmail: string | null;
    submittedAt: string | null;
    reviewedAt: string | null;
    revisionNotes: string | null;
  };

  // Questions merged with responses, sorted by displayOrder
  questionResponses: {
    question: {
      id: string;
      section: string;
      questionText: string;
      idNotes: string;
      idNotesExtended?: string;
      stakeholderGuidance: string;
      fieldType: FieldType;
      required: boolean;
      options?: string[];
    };
    response: {
      value: string;
      updatedBy: string | null;
      updatedAt: string;
    } | null;  // null if question wasn't answered
  }[];

  // Change history
  changeLog: {
    questionId: string;
    questionText: string;     // Resolved from TypeScript constants
    changedBy: string;
    previousValue: string | null;
    newValue: string;
    changedAt: string;
  }[];
}
```

---

### POST /api/stakeholder/submissions/[submissionId]/approve

Approve a submission. Data becomes available for use in the project's design workflow.

**Logic:**
1. Verify authenticated user and workspace access
2. Verify submission status is SUBMITTED or UNDER_REVIEW
3. Update status to APPROVED
4. Set `reviewedAt` to now, `reviewedById` to current user

**Response:**
```typescript
{
  success: true;
  submissionId: string;
  status: "APPROVED";
  reviewedAt: string;
}
```

---

### POST /api/stakeholder/submissions/[submissionId]/request-revision

Send the submission back to the stakeholder with notes about what needs to change.

**Request body:**
```typescript
{
  revisionNotes: string;  // Required — what the ID wants changed
}
```

**Logic:**
1. Verify authenticated user and workspace access
2. Verify submission status is SUBMITTED or UNDER_REVIEW
3. Update status to REVISION_REQUESTED
4. Set `revisionNotes` on the submission
5. Set `reviewedAt` to now, `reviewedById` to current user
6. Reactivate the token (`isActive = true`) — so the stakeholder can access the form again

**Response:**
```typescript
{
  success: true;
  submissionId: string;
  status: "REVISION_REQUESTED";
  reviewedAt: string;
}
```

**Note:** Reactivating the token is critical — without it, the stakeholder can't open the form to make revisions. The token was deactivated on submit to prevent edits while under review.

---

## Authentication & Authorization Summary

| Route Group | Auth Method | Access Check |
|---|---|---|
| Token routes (`/api/stakeholder/tokens/*`) | User session (NextAuth) | User must be workspace member for the project |
| Form routes (`/api/stakeholder/form/[token]/*`) | Token string in URL | Token must exist, be active, not expired |
| Review routes (`/api/stakeholder/submissions/*`) | User session (NextAuth) | User must be workspace member for the project |

The form routes intentionally do NOT require a user session. The stakeholder may not have an EDUTex account — they're an external collaborator accessing a specific form via a shared link.

---

## Error Handling

Standard error responses across all routes:

| Status | When | Response Shape |
|---|---|---|
| 400 | Validation error (missing fields, bad data) | `{ error: string; details?: object }` |
| 401 | Not authenticated (session routes) | `{ error: "UNAUTHORIZED" }` |
| 403 | No access to workspace/project, or submission in wrong status | `{ error: "FORBIDDEN"; message: string }` |
| 404 | Token, submission, or project not found | `{ error: "NOT_FOUND" }` |
| 410 | Token expired or deactivated | `{ error: "TOKEN_EXPIRED" }` |

---

## File Structure

```
app/api/stakeholder/
├── tokens/
│   ├── route.ts              → POST (create), GET (list)
│   └── [tokenId]/
│       └── route.ts          → PATCH (update/deactivate)
│
├── form/
│   └── [token]/
│       ├── route.ts          → GET (load form)
│       ├── identify/
│       │   └── route.ts      → POST (set stakeholder name)
│       ├── responses/
│       │   └── route.ts      → PUT (save responses)
│       └── submit/
│           └── route.ts      → POST (submit form)
│
└── submissions/
    ├── route.ts              → GET (list submissions)
    └── [submissionId]/
        ├── route.ts          → GET (full detail)
        ├── approve/
        │   └── route.ts      → POST (approve)
        └── request-revision/
            └── route.ts      → POST (request revision)
```

---

## Claude Code Implementation Prompt

```
Implement the Stakeholder Needs Analysis API routes for EDUTex.

## Context

The data model is already in place:
- Prisma models: StakeholderAccessToken, StakeholderSubmission, StakeholderResponse, StakeholderChangeLog
- TypeScript types: lib/types/stakeholderAnalysis.ts (enums), lib/types/questionDefinition.ts (interfaces)
- Question constants: lib/questions/index.ts exports getQuestionsForType(), QUESTION_MAP, ALL_QUESTIONS
- Existing auth pattern: check how other API routes in app/api/ handle authentication and workspace access

## File Structure to Create

app/api/stakeholder/
├── tokens/
│   ├── route.ts              → POST + GET handlers
│   └── [tokenId]/
│       └── route.ts          → PATCH handler
├── form/
│   └── [token]/
│       ├── route.ts          → GET handler
│       ├── identify/
│       │   └── route.ts      → POST handler
│       ├── responses/
│       │   └── route.ts      → PUT handler
│       └── submit/
│           └── route.ts      → POST handler
└── submissions/
    ├── route.ts              → GET handler
    └── [submissionId]/
        ├── route.ts          → GET handler
        ├── approve/
        │   └── route.ts      → POST handler
        └── request-revision/
            └── route.ts      → POST handler

## Route Implementations

### 1. POST /api/stakeholder/tokens
- Auth: session required, verify workspace membership for the project
- Body: { projectId: string, trainingType: TrainingType, expiresAt?: string }
- Create StakeholderAccessToken with createdById = current user
- ALSO create StakeholderSubmission in DRAFT status linked to this token (denormalize projectId and trainingType)
- Return token record with the generated token string and a formUrl like "/stakeholder/form/{token}"

### 2. GET /api/stakeholder/tokens?projectId=xxx
- Auth: session required, verify workspace membership
- Return all tokens for the project with submission status, stakeholder name, and response count
- Include: { id, token, trainingType, isActive, expiresAt, stakeholderName, stakeholderEmail, createdAt, submission: { id, status, submittedAt, responseCount } }

### 3. PATCH /api/stakeholder/tokens/[tokenId]
- Auth: session required, verify workspace membership
- Body: { isActive?: boolean, expiresAt?: string | null }
- Update the token

### 4. GET /api/stakeholder/form/[token]
- Auth: token-based (no session). Look up token by the [token] param. Validate: exists, isActive, not expired.
- Get training type from token
- Call getQuestionsForType(trainingType) from lib/questions/index.ts
- Load submission and existing responses
- Return: projectName, trainingType, trainingTypeLabel, submission status/revisionNotes, stakeholderName, stakeholderEmail, questions (WITHOUT idNotes or idNotesExtended — stakeholder-facing), and responses as Record<string, string>
- Strip idNotes and idNotesExtended from questions before returning — map questions to only include: id, section, questionText, stakeholderGuidance, fieldType, required, options, displayOrder, conditional

### 5. POST /api/stakeholder/form/[token]/identify
- Auth: token-based
- Body: { name: string, email?: string }
- Update StakeholderAccessToken with stakeholderName and stakeholderEmail
- Return { success: true, name }

### 6. PUT /api/stakeholder/form/[token]/responses
- Auth: token-based
- Body: { responses: { questionId: string, value: string }[], changedBy: string }
- Verify submission status is DRAFT or REVISION_REQUESTED (reject 403 otherwise)
- For each response:
  - Upsert StakeholderResponse (unique on [submissionId, questionId])
  - If value changed from previous: create StakeholderChangeLog entry with previousValue, newValue, changedBy
  - If new response (no previous): create change log with previousValue = null
  - If value is same as previous: skip change log (no-op)
- Return { saved: number, changed: number }

### 7. POST /api/stakeholder/form/[token]/submit
- Auth: token-based
- Validate required questions: get questions via getQuestionsForType(), check each required question has a non-empty response
- For conditional required questions: only require if the condition is met (check the parent question's response against the conditional rule)
- If missing required: return 400 with { error: "MISSING_REQUIRED_RESPONSES", missingQuestions: [{ questionId, questionText, section }] }
- Update submission status to SUBMITTED, set submittedAt = now()
- Deactivate the token (isActive = false)
- Return { success: true, submissionId, status: "SUBMITTED", submittedAt }
- Special case: if current status is REVISION_REQUESTED, allow re-submission (status goes to SUBMITTED)

### 8. GET /api/stakeholder/submissions?projectId=xxx&status=xxx
- Auth: session required, verify workspace membership
- Query submissions for the project, optionally filter by status
- Include token info (stakeholderName, trainingType) and response count
- Also include totalQuestions for each training type (call getQuestionsForType().length)

### 9. GET /api/stakeholder/submissions/[submissionId]
- Auth: session required, verify workspace membership through submission → project → workspace
- Load full submission with all responses and change logs
- Get questions for the training type INCLUDING idNotes and idNotesExtended (this is the ID-facing view)
- Merge questions with responses: for each question, attach the matching response (or null if unanswered)
- Sort by displayOrder
- Also return change log with questionText resolved from QUESTION_MAP
- Return the full questionResponses array and changeLog array

### 10. POST /api/stakeholder/submissions/[submissionId]/approve
- Auth: session required, verify workspace membership
- Verify status is SUBMITTED or UNDER_REVIEW
- Update status to APPROVED, set reviewedAt = now(), reviewedById = current user
- Return { success: true, submissionId, status: "APPROVED", reviewedAt }

### 11. POST /api/stakeholder/submissions/[submissionId]/request-revision
- Auth: session required, verify workspace membership
- Body: { revisionNotes: string } (required)
- Verify status is SUBMITTED or UNDER_REVIEW
- Update status to REVISION_REQUESTED, set revisionNotes, reviewedAt, reviewedById
- IMPORTANT: Reactivate the token (isActive = true) so the stakeholder can access the form again
- Return { success: true, submissionId, status: "REVISION_REQUESTED", reviewedAt }

## Important Implementation Notes

1. Follow the existing API route patterns in the codebase for auth checks, error handling, and response formatting
2. Use prisma transactions where multiple writes need to be atomic (especially the responses save with change logs)
3. The form routes (Group 2) do NOT use session auth — they validate the token string from the URL parameter
4. Always check token.isActive and token.expiresAt on form routes
5. The getQuestionsForType() function is the single source of truth for which questions appear on a form
6. QUESTION_MAP is used to resolve questionId → questionText for the change log display
7. When creating a token, also create the submission in the same transaction
```
