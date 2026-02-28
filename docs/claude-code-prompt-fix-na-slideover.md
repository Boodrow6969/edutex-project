# Claude Code Prompt: Fix NA Slide-Over Tab Mapping & Screen 1 Summary

## Context

The Learning Objectives Wizard's Needs Analysis slide-over and Screen 1 summary are displaying data incorrectly. The root cause is in `page.tsx` — the `buildNASections()` and `buildNASummary()` functions use hardcoded field guesses against `courseAnalysis` fields instead of pulling from actual stakeholder submission responses grouped by the `QUESTION_MAP` section metadata.

## Problem Summary

1. **Slide-over tabs are wrong.** Only 3 of 5 tabs appear. Stakeholder submission responses are dumped into "Stakeholder Pain Points" regardless of their actual section. "About the System" and "Constraints & Environment" tabs are empty/missing because they try to pull from `courseAnalysis` fields that may not be populated.

2. **Screen 1 summary fields are empty.** Training Type, Business Goal, Current State, and Desired State show no data because `buildNASummary()` maps to `courseAnalysis` field names that don't match the actual schema, and it ignores submission responses entirely.

3. **Screen 1 labels should be training-type-aware.** For NEW_SYSTEM, "Current State" should read "Current System/Process" and "Desired State" should read "Proficiency at Go-Live."

## Design Principle

The slide-over is a **reference tool optimized for objective writing**. The ID is asking "what do these people need to do?" — the tab hierarchy prioritizes that question. All other data is subordinate and supportive.

## Fix 1: Tab Mapping Configuration

Create a new file at the objectives wizard level (e.g., `naTabMapping.ts` or add to existing `constants.ts`) that defines the consolidation layer. This maps the `section` field from `QUESTION_MAP` question definitions into slide-over tabs.

### Tab Structure (priority order)

| Tab Key | Tab Title | Color | Source Sections (from QUESTION_MAP) |
|---------|-----------|-------|-------------------------------------|
| `tasks` | What They Need to Do | `#03428e` (primary blue) | "What Users Need to Do" |
| `system` | The System / Change | `#10b981` (green) | "About the System", "Business Justification" |
| `audience` | Who's Learning | `#f59e0b` (amber) | "Who Will Use This System" + any learner profile sections |
| `constraints` | Constraints & Environment | `#ef4444` (red) | "Training Constraints and Resources", "Rollout Plan" |
| `project` | Project & Stakeholders | `#3b82f6` (blue) | "Project Context", "SMEs and Stakeholders", "Concerns and Final Thoughts" |

### Config Shape

```typescript
// NEW_SYSTEM mapping — fully defined
// Other training types get stub mappings that route everything to reasonable defaults

interface SlideOverTab {
  key: string;
  title: string;
  color: string;
  /** Section names from QUESTION_MAP that consolidate into this tab */
  sourceSections: string[];
}

const NEW_SYSTEM_TABS: SlideOverTab[] = [
  {
    key: 'tasks',
    title: 'What They Need to Do',
    color: '#03428e',
    sourceSections: ['What Users Need to Do'],
  },
  {
    key: 'system',
    title: 'The System / Change',
    color: '#10b981',
    sourceSections: ['About the System', 'Business Justification'],
  },
  {
    key: 'audience',
    title: "Who's Learning",
    color: '#f59e0b',
    sourceSections: ['Who Will Use This System'],
  },
  {
    key: 'constraints',
    title: 'Constraints & Environment',
    color: '#ef4444',
    sourceSections: ['Training Constraints and Resources', 'Rollout Plan'],
  },
  {
    key: 'project',
    title: 'Project & Stakeholders',
    color: '#3b82f6',
    sourceSections: ['Project Context', 'SMEs and Stakeholders', 'Concerns and Final Thoughts'],
  },
];

// Stub mappings for other training types — routes all sections to generic tabs
// TODO: Define proper mappings when those training type forms are tested
const GENERIC_TABS: SlideOverTab[] = [
  {
    key: 'tasks',
    title: 'What They Need to Do',
    color: '#03428e',
    sourceSections: [], // Will catch type-specific task sections
  },
  {
    key: 'system',
    title: 'The Change',
    color: '#10b981',
    sourceSections: [], // Will catch type-specific context sections
  },
  {
    key: 'audience',
    title: "Who's Learning",
    color: '#f59e0b',
    sourceSections: ['Who Will Use This System'],
  },
  {
    key: 'constraints',
    title: 'Constraints & Environment',
    color: '#ef4444',
    sourceSections: ['Training Constraints and Resources', 'Rollout Plan'],
  },
  {
    key: 'project',
    title: 'Project & Stakeholders',
    color: '#3b82f6',
    sourceSections: ['Project Context', 'SMEs and Stakeholders', 'Concerns and Final Thoughts'],
  },
];

export function getTabsForTrainingType(trainingType: string): SlideOverTab[] {
  switch (trainingType) {
    case 'NEW_SYSTEM':
      return NEW_SYSTEM_TABS;
    // case 'PERFORMANCE_PROBLEM':
    // case 'COMPLIANCE':
    // case 'ROLE_CHANGE':
    default:
      return GENERIC_TABS;
  }
}
```

### Unmapped Section Fallback

Any submission response whose `section` doesn't match any `sourceSections` entry should fall into the last tab ("Project & Stakeholders") rather than being lost. This is the safety net.

## Fix 2: Rewrite `buildNASections()` in page.tsx

The current function tries to build tabs from `courseAnalysis` fields. Replace it entirely.

### New Logic

1. Get the training type from `course.courseType`
2. Get the tab config from `getTabsForTrainingType(trainingType)`
3. Iterate all submission responses (from `contextData.submissions`)
4. For each response, look up the question's `section` via `QUESTION_MAP[questionId].section`
5. Find which tab that section maps to (search `sourceSections` arrays)
6. Group responses into tabs
7. Also pull any relevant `courseAnalysis` data into the appropriate tabs (as supplementary info — e.g., if the ID has written a `problemSummary` in course analysis, add it to the system tab)
8. Return only tabs that have at least one item
9. If NO tabs have items, return a single "Project Context" tab with a "No data available" message

### Important Details

- **Response formatting:** Each response should show as `{stakeholderName}: {questionText}` for the question label (`q` field) and the response value for the answer (`a` field). This matches what Image 1 in the screenshots shows — the current implementation already does this correctly for the Pain Points tab.
- **Multiple submissions:** If multiple approved submissions exist, responses from all of them should appear in the appropriate tabs, prefixed with the stakeholder name.
- **Preserve display order:** Within each tab, sort responses by the question's `displayOrder` from `QUESTION_MAP`.
- **Import `QUESTION_MAP`** from `@/lib/questions` — it's already available as a project dependency.

### Pseudocode

```typescript
function buildNASections(
  contextData: Record<string, unknown> | null,
  course: Record<string, unknown>
): NASection[] {
  if (!contextData) {
    return [{ key: 'project', title: 'Project Context', color: '#3b82f6', items: [{ q: 'Status', a: 'No Needs Analysis data available.' }] }];
  }

  const trainingType = (course.courseType as string) || '';
  const tabConfig = getTabsForTrainingType(trainingType);
  const submissions = (contextData.submissions as SubmissionDisplay[]) || [];
  const ca = contextData.courseAnalysis as CourseAnalysisFormData | undefined;

  // Build a map: tab key → items[]
  const tabItems: Record<string, { q: string; a: string; order: number }[]> = {};
  for (const tab of tabConfig) {
    tabItems[tab.key] = [];
  }

  // Route submission responses to tabs
  for (const sub of submissions) {
    const name = sub.stakeholderName || 'Stakeholder';
    for (const sec of sub.sections) {
      for (const resp of sec.responses) {
        if (!resp.value) continue;

        const qDef = QUESTION_MAP[resp.questionId];
        const qSection = qDef?.section ?? sec.title;
        const displayOrder = qDef?.displayOrder ?? 9999;

        // Find which tab this section belongs to
        let targetTab = tabConfig.find(t => t.sourceSections.includes(qSection));
        if (!targetTab) {
          // Fallback: last tab (Project & Stakeholders)
          targetTab = tabConfig[tabConfig.length - 1];
        }

        tabItems[targetTab.key].push({
          q: `${name}: ${qDef?.questionText ?? resp.question ?? resp.questionId}`,
          a: resp.value,
          order: displayOrder,
        });
      }
    }
  }

  // Optionally add courseAnalysis supplementary data to relevant tabs
  // (Only if the ID has filled in course analysis fields — these supplement, not replace)
  if (ca?.problemSummary) {
    tabItems['system']?.push({ q: 'ID Analysis: Problem Summary', a: ca.problemSummary, order: 0 });
  }
  if (ca?.solutionRationale) {
    tabItems['system']?.push({ q: 'ID Analysis: Solution Rationale', a: ca.solutionRationale, order: 1 });
  }
  // Add audience profiles from course analysis if they exist
  if (ca?.audiences && ca.audiences.length > 0) {
    const audienceText = ca.audiences
      .map(a => `${a.role}${a.headcount ? ` (~${a.headcount})` : ''} — ${a.frequency || ''}, Tech: ${a.techComfort || ''}`)
      .join('\n');
    tabItems['audience']?.push({ q: 'ID Analysis: Audience Profiles', a: audienceText, order: 0 });
  }

  // Sort items within each tab by displayOrder
  for (const key of Object.keys(tabItems)) {
    tabItems[key].sort((a, b) => a.order - b.order);
  }

  // Build final NASection array — only include tabs that have items
  const sections: NASection[] = tabConfig
    .filter(tab => tabItems[tab.key].length > 0)
    .map(tab => ({
      key: tab.key,
      title: tab.title,
      color: tab.color,
      items: tabItems[tab.key].map(({ q, a }) => ({ q, a })),
    }));

  return sections.length > 0
    ? sections
    : [{ key: 'project', title: 'Project Context', color: '#3b82f6', items: [{ q: 'Status', a: 'No data available yet.' }] }];
}
```

## Fix 3: Rewrite `buildNASummary()` in page.tsx

The current function pulls from `courseAnalysis` fields that may be empty. Instead, pull from submission responses using specific question IDs, with training-type-aware labels.

### Question ID Mapping for Screen 1 Summary (NEW_SYSTEM)

| Summary Field | Label (NEW_SYSTEM) | Primary Source | Fallback |
|---------------|-------------------|----------------|----------|
| Training Type | Training Type | `course.courseType` (format for display) | — |
| Business Goal | Business Problem | Question `SYS_05` response | `courseAnalysis.problemSummary` |
| Target Audience | Target Audience | Question `SHARED_06` response (role table) | `courseAnalysis.audiences` |
| Current State | Current System / Process | Question `SYS_03` response | `courseAnalysis.currentStateSummary` |
| Desired State | Proficiency at Go-Live | Question `SYS_11` response | `courseAnalysis.desiredStateSummary` |
| Pain Points | Stakeholder Concerns | Question `SHARED_25` response | `courseAnalysis.constraints` |

### Updated NASummary Type

Add a `labels` field so Screen1Context can display training-type-aware labels:

```typescript
// In types.ts — update NASummary
export interface NASummary {
  trainingType: string;
  businessGoal: string;
  audience: string;
  currentState: string;
  desiredState: string;
  painPoints: string[];
  // Training-type-aware display labels
  labels: {
    businessGoal: string;
    currentState: string;
    desiredState: string;
  };
}
```

### Label Defaults by Training Type

```typescript
function getSummaryLabels(trainingType: string) {
  switch (trainingType) {
    case 'NEW_SYSTEM':
      return {
        businessGoal: 'Business Problem',
        currentState: 'Current System / Process',
        desiredState: 'Proficiency at Go-Live',
      };
    case 'PERFORMANCE_PROBLEM':
      return {
        businessGoal: 'Performance Problem',
        currentState: 'Current Performance',
        desiredState: 'Desired Performance',
      };
    // Stubs for other types — refine later
    case 'COMPLIANCE':
      return {
        businessGoal: 'Compliance Requirement',
        currentState: 'Current State',
        desiredState: 'Required State',
      };
    case 'ROLE_CHANGE':
      return {
        businessGoal: 'Business Driver',
        currentState: 'Current Role Scope',
        desiredState: 'Expanded Role Scope',
      };
    default:
      return {
        businessGoal: 'Business Goal',
        currentState: 'Current State',
        desiredState: 'Desired State',
      };
  }
}
```

### Helper: Extract Response by Question ID

```typescript
/**
 * Find the first response matching a question ID across all submissions.
 * Returns the response value or empty string.
 */
function getSubmissionResponse(
  submissions: SubmissionDisplay[],
  questionId: string
): string {
  for (const sub of submissions) {
    for (const sec of sub.sections) {
      for (const resp of sec.responses) {
        if (resp.questionId === questionId && resp.value) {
          return resp.value;
        }
      }
    }
  }
  return '';
}
```

### New buildNASummary

```typescript
function buildNASummary(
  contextData: Record<string, unknown> | null,
  course: Record<string, unknown>
): NASummary | null {
  if (!contextData) return null;

  const ca = contextData.courseAnalysis as CourseAnalysisFormData | undefined;
  const submissions = (contextData.submissions as SubmissionDisplay[]) || [];
  const trainingType = (course.courseType as string) || '';
  const labels = getSummaryLabels(trainingType);

  // Format training type for display
  const trainingTypeDisplay = trainingType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()); // "NEW_SYSTEM" → "New System"

  // Build audience string
  const audiences = ca?.audiences || [];
  let audienceStr = '';
  if (audiences.length > 0) {
    audienceStr = audiences.map(a => a.role).join(', ');
  } else {
    // Try submission response for SHARED_06 (repeating table — may be formatted differently)
    audienceStr = getSubmissionResponse(submissions, 'SHARED_06');
  }
  if (!audienceStr) {
    audienceStr = (ca?.learnerPersonas || []).join(', ');
  }

  // Build pain points
  const painPoints: string[] = [];
  const concerns = getSubmissionResponse(submissions, 'SHARED_25');
  if (concerns) {
    // Split on newlines or bullet points
    painPoints.push(...concerns.split(/\n|•/).map(s => s.trim()).filter(Boolean));
  }
  if (painPoints.length === 0 && ca?.constraints) {
    painPoints.push(...ca.constraints);
  }

  return {
    trainingType: trainingTypeDisplay,
    businessGoal: getSubmissionResponse(submissions, 'SYS_05') || ca?.problemSummary || '',
    audience: audienceStr,
    currentState: getSubmissionResponse(submissions, 'SYS_03') || ca?.currentStateSummary || '',
    desiredState: getSubmissionResponse(submissions, 'SYS_11') || ca?.desiredStateSummary || '',
    painPoints,
    labels,
  };
}
```

## Fix 4: Update Screen1Context.tsx

Update the summary rows to use the dynamic labels from `naSummary.labels`:

```typescript
// In Screen1Context.tsx — replace the hardcoded summaryRows
const summaryRows = naSummary
  ? [
      { l: 'Training Type', v: naSummary.trainingType },
      { l: naSummary.labels.businessGoal, v: naSummary.businessGoal },
      { l: 'Target Audience', v: naSummary.audience },
      { l: naSummary.labels.currentState, v: naSummary.currentState },
      { l: naSummary.labels.desiredState, v: naSummary.desiredState },
    ]
  : [];
```

## Fix 5: Update default tab behavior

The `openNA` callback currently defaults to `'project'`. Update the default to `'tasks'` since that's the hero tab — the primary question the ID needs answered.

In `ObjectivesWizard.tsx`:
```typescript
// Change default from 'project' to 'tasks'
const openNA = useCallback((tab: string) => {
  setSoTab(tab || 'tasks');
  setSoOpen(true);
}, []);
```

Also update the context-specific tab opening for the Objective Builder (if not already wired):
- Audience field → opens to `'audience'`
- Condition's System Info button → opens to `'system'`
- Freeform mode header → opens to `'tasks'`
- Global header button → opens to `'tasks'`

## Files to Modify

1. **New file:** `naTabMapping.ts` (or add config to existing `constants.ts`) in the objectives wizard directory
2. **`page.tsx`** — Replace `buildNASections()` and `buildNASummary()`, add `getSubmissionResponse()` helper, import `QUESTION_MAP` from `@/lib/questions`
3. **`types.ts`** — Add `labels` field to `NASummary` interface
4. **`Screen1Context.tsx`** — Use `naSummary.labels` for dynamic row labels
5. **`ObjectivesWizard.tsx`** — Change default tab from `'project'` to `'tasks'`

## Files NOT to Modify

- `NASlideOver.tsx` — already works correctly as a generic renderer. The tabs it receives just need to be correct.
- `analysis-context/route.ts` — the API is returning the right data, it's just being mapped wrong on the client.
- Any files in `lib/questions/` — these are the source of truth, not the problem.

## Testing

After implementation:
1. Navigate to a course with an approved NEW_SYSTEM stakeholder submission
2. Open the Learning Objectives wizard
3. **Screen 1:** Verify all summary fields are populated. "Current System / Process" should show the SYS_03 response (what the system replaces). "Proficiency at Go-Live" should show SYS_11.
4. **Slide-over:** Click "Needs Analysis Data" in the header. Verify 5 tabs appear with correct titles. "What They Need to Do" should be the first/default tab showing SYS_09–12 responses. "About the System" questions should NOT appear under "Stakeholder Pain Points."
5. **Context-specific opening:** From the Objective Builder, clicking system-related NA buttons should open the "The System / Change" tab.
