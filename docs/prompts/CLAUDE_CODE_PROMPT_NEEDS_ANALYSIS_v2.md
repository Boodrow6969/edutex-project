# Claude Code Prompt: Restyle Needs Analysis to Match Figma

## Context

You are working on EDUTex, an instructional design platform built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Prisma.

**What exists:**
- `components/pages/NeedsAnalysisView.tsx` (316 lines) — A working two-panel component with block editor + AI analysis. The AI extraction feature calls `/api/ai/analyzeNeeds` and displays results.
- `lib/types/needsAnalysis.ts` — Types for `NeedsAnalysisResult` and `RecommendedTask`
- AI endpoint works and should be preserved

**Goal:** Restyle and restructure the Needs Analysis UI to match Figma mockups while preserving the AI extraction functionality.

---

## Design Requirements

### Brand Colors (Updated)

```
Primary Blue:    #03428e  ← NEW (was #2463EB)
Background:      #FFFFFF
Card Background: #FFFFFF with border #E5E7EB
Text Primary:    #111827
Text Secondary:  #6B7280
Success:         #22C55E
Warning:         #F59E0B  
Danger:          #EF4444
```

### New Structure: 4 Sub-Tabs

Replace the two-panel layout with a tabbed interface:

```
┌─────────────────────────────────────────────────────────────────┐
│ Needs Analysis                                    [Save Progress]│
│ Conduct a comprehensive analysis aligned with adult learning... │
├─────────────────────────────────────────────────────────────────┤
│ [Problem] [Stakeholders] [Performance] [Success Metrics]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tab Content Here                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tab Content

**Tab 1: Problem**
```
┌─────────────────────────────────────────────────────────────────┐
│ Problem Definition                                              │
│ Define the core problem to solve and business need              │
│ [Collapsible Guidance Panel]                                    │
├─────────────────────────────────────────────────────────────────┤
│ Problem Statement *                                             │
│ [textarea]                                                      │
│                                                                 │
│ Business Need                                                   │
│ [textarea]                                                      │
│                                                                 │
│ Department / Division                                           │
│ [text input]                                                    │
├─────────────────────────────────────────────────────────────────┤
│ Reality Check                                                   │
├─────────────────────────────────────────────────────────────────┤
│ Constraints                        [+ button]                   │
│ [list of added items]                                           │
│                                                                 │
│ Assumptions                        [+ button]                   │
│ [list of added items]                                           │
└─────────────────────────────────────────────────────────────────┘
```

**Tab 2: Stakeholders**
- Learner Personas (multi-input with + button)
- Stakeholders (multi-input with + button)
- Subject Matter Experts (multi-input with + button)

**Tab 3: Performance**
- Current State (textarea)
- Desired State (textarea)

**Tab 4: Success Metrics**
- Level 1: Reaction (textarea)
- Level 2: Learning (textarea)
- Level 3: Behavior (textarea)
- Level 4: Results (textarea)

---

## Preserve AI Functionality

The existing AI extraction feature should be integrated, not removed. Options:

1. **Add "Import from Notes" button** — Opens a modal where users can paste SME notes, click Analyze, and auto-populate form fields from AI results
2. **Or** put the AI panel in the floating "AI Assistant" button on the right side (matching Figma's AI Assistant placement)

Map AI results to form fields:
- `summary` → Problem Statement
- `audienceNotes` → Learner Personas
- `constraints[]` → Constraints list
- `keyInsights[]` → Could populate Business Need or other fields

---

## Guidance Panels

Each section should have a collapsible guidance panel with instructional design talking notes.

Example for Problem Statement:
```
▼ Guidance
"What's going wrong? Ask stakeholders to describe the specific 
observable problem. Listen for: complaints, errors, missed targets, 
customer feedback. Push back on vague answers like 'they need 
training' — ask 'What would you see differently if they had this 
training?'"
```

### All Guidance Content

**Problem Statement:**
> "What's going wrong? Ask stakeholders to describe the specific observable problem. Listen for: complaints, errors, missed targets, customer feedback. Push back on vague answers like 'they need training' — ask 'What would you see differently if they had this training?'"

**Business Need:**
> "Why does this matter to the business? Connect to revenue, cost, compliance, or strategic goals. If they can't articulate this, training may not be the solution."

**Constraints:**
> "What limits exist? Budget, timeline, technology access, union rules, geographic distribution. These shape what's possible in the solution."

**Assumptions:**
> "What do learners already know? What's NOT a training problem? Document these to avoid scope creep and set realistic expectations."

**Learner Personas:**
> "Who needs to do what differently? Get specific: job titles, experience levels, current skill gaps. Ask 'If I shadowed this person for a day, what would I see them struggling with?'"

**Stakeholders:**
> "Who has skin in the game? Identify decision-makers, budget holders, and people who will judge success. Their priorities shape evaluation criteria."

**SMEs:**
> "Who knows how to do this well? Find top performers, not just managers. The gap between what SMEs do and what average performers do reveals the real training content."

**Current State:**
> "What are people doing now? Be specific and observable. Not 'they don't understand the system' but 'they take 15 minutes to process a case that should take 5.'"

**Desired State:**
> "What would 'good' look like? Describe the observable behavior after training. This becomes the basis for learning objectives and evaluation."

**Level 1 - Reaction:**
> "Did they like it? Satisfaction surveys, NPS scores. Easy to measure but doesn't predict behavior change."

**Level 2 - Learning:**
> "Did they learn it? Knowledge checks, skill demonstrations, certifications. Measures if training worked, not if it transfers."

**Level 3 - Behavior:**
> "Are they doing it? Manager observations, quality audits, system data. This is where training proves its value — usually measured 30-90 days post-training."

**Level 4 - Results:**
> "Did business improve? The KPIs stakeholders care about: sales, errors, time, satisfaction. Hardest to attribute directly to training but most important to leadership."

---

## Tailwind Styling

Use these classes to match the Figma design:

```jsx
// Card container
<div className="bg-white border border-gray-200 rounded-lg p-6">

// Section heading
<h3 className="text-lg font-semibold text-gray-900 mb-1">Problem Definition</h3>
<p className="text-sm text-gray-500 mb-4">Define the core problem to solve and business need</p>

// Label
<label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement *</label>

// Textarea
<textarea className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e]" />

// Text input
<input type="text" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e]" />

// Primary button
<button className="bg-[#03428e] hover:bg-[#022d61] text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2">

// Tab (active)
<button className="px-4 py-2 text-sm font-medium text-[#03428e] border-b-2 border-[#03428e]">

// Tab (inactive)  
<button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">

// Add button (circular with +)
<button className="bg-[#03428e] hover:bg-[#022d61] text-white p-2 rounded-lg">
  <PlusIcon className="w-5 h-5" />
</button>

// Guidance panel
<details className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
  <summary className="text-sm font-medium text-[#03428e] cursor-pointer">Guidance</summary>
  <p className="text-sm text-gray-600 mt-2">...</p>
</details>

// Multi-input item (removable)
<div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
  <span className="text-sm text-gray-700 flex-1">Item text</span>
  <button className="text-gray-400 hover:text-red-500">
    <XIcon className="w-4 h-4" />
  </button>
</div>
```

---

## Updated Type Definitions

Update `lib/types/needsAnalysis.ts`:

```typescript
// Keep existing types for AI results
export interface RecommendedTask {
  title: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  description?: string;
}

export interface NeedsAnalysisResult {
  summary: string;
  keyInsights: string[];
  audienceNotes: string;
  constraints: string[];
  recommendedTasks: RecommendedTask[];
}

// Add new types for form data
export interface NeedsAnalysisFormData {
  // Problem tab
  problemStatement: string;
  businessNeed: string;
  department: string;
  constraints: string[];
  assumptions: string[];
  
  // Stakeholders tab
  learnerPersonas: string[];
  stakeholders: string[];
  smes: string[];
  
  // Performance tab
  currentState: string;
  desiredState: string;
  
  // Success Metrics tab (Kirkpatrick)
  level1Reaction: string;
  level2Learning: string;
  level3Behavior: string;
  level4Results: string;
}

export interface NeedsAnalysisProps {
  projectId: string;
  initialData?: Partial<NeedsAnalysisFormData>;
  onSave?: (data: NeedsAnalysisFormData) => Promise<void>;
}
```

---

## Implementation Steps

### Step 1: Create reusable components

**`components/ui/MultiInput.tsx`**
- Text input with + button
- Displays list of added items below
- Each item has X button to remove
- Props: label, placeholder, items[], onAdd, onRemove, guidance?

**`components/ui/GuidancePanel.tsx`**
- Collapsible panel using `<details>` element
- Blue-tinted background
- Props: children (the guidance text)

**`components/ui/SubTabBar.tsx`**
- Horizontal tab bar
- Active tab has bottom border in primary color
- Props: tabs[], activeTab, onTabChange

### Step 2: Create tab content components

Create in `components/needs-analysis/`:
- `ProblemTab.tsx`
- `StakeholdersTab.tsx`
- `PerformanceTab.tsx`
- `SuccessMetricsTab.tsx`

Each receives form data and onChange handlers as props.

### Step 3: Refactor NeedsAnalysisView.tsx

- Replace two-panel layout with header + tab bar + tab content
- Use React state for form data and active tab
- Preserve AI analysis functionality (add "Import from Notes" modal or integrate into AI Assistant)
- Add Save Progress button that persists data

### Step 4: Add AI Import Modal (Optional Enhancement)

A modal that:
1. Shows textarea for pasting SME notes
2. "Analyze" button calls existing `/api/ai/analyzeNeeds`
3. Maps results to form fields
4. User can review and confirm before importing

---

## File Changes Summary

**Modify:**
- `components/pages/NeedsAnalysisView.tsx` — Complete restyle and restructure
- `lib/types/needsAnalysis.ts` — Add form data types

**Create:**
- `components/ui/MultiInput.tsx`
- `components/ui/GuidancePanel.tsx`
- `components/ui/SubTabBar.tsx`
- `components/needs-analysis/ProblemTab.tsx`
- `components/needs-analysis/StakeholdersTab.tsx`
- `components/needs-analysis/PerformanceTab.tsx`
- `components/needs-analysis/SuccessMetricsTab.tsx`

**Keep unchanged:**
- `app/api/ai/analyzeNeeds/route.ts` — Works as-is

---

## Acceptance Criteria

1. ✅ Visual design matches Figma (colors, spacing, typography)
2. ✅ Primary color is #03428e throughout
3. ✅ 4-tab navigation works (Problem, Stakeholders, Performance, Success Metrics)
4. ✅ All form fields present and styled correctly
5. ✅ Multi-input fields add/remove items
6. ✅ Guidance panels are collapsible with ID talking notes
7. ✅ AI analysis feature still accessible (Import from Notes or AI Assistant)
8. ✅ Save Progress button present (can be placeholder for now)
9. ✅ TypeScript strict mode passes
10. ✅ No console errors

---

## Order of Work

1. Create `MultiInput.tsx` component
2. Create `GuidancePanel.tsx` component  
3. Create `SubTabBar.tsx` component
4. Update type definitions
5. Create the 4 tab content components
6. Refactor `NeedsAnalysisView.tsx` to use new components
7. Test all tabs and interactions
8. Integrate AI import functionality

Start with the reusable components, then build up.
