# Browser Test: Learning Objectives Wizard — NA Slide-Over & Content Priority

## Setup

1. Start the dev server (`npm run dev` or equivalent)
2. Open a browser to the app
3. Navigate to a course that has an approved NEW_SYSTEM stakeholder submission
4. Open the Learning Objectives wizard (objectives page for that course)

## Test 1: Screen 1 — Context & Gap Check

**Expected:**
- Needs Analysis Summary card shows 5 rows with data:
  - "Training Type" — should display formatted type (e.g., "New System")
  - "Business Problem" (NOT "Business Goal") — should show the SYS_05 response (what business problem the system solves)
  - "Target Audience" — should show audience roles
  - "Current System / Process" (NOT "Current State") — should show SYS_03 response (what the system replaces)
  - "Proficiency at Go-Live" (NOT "Desired State") — should show SYS_11 response (what proficient use looks like by go-live)
- Pain Points section should show SHARED_25 response (stakeholder concerns)

**Screenshot:** Take a screenshot of Screen 1. Flag if any fields are empty or if labels still say "Business Goal" / "Current State" / "Desired State."

## Test 2: NA Slide-Over — Tab Structure

**Steps:**
1. Click "Needs Analysis Data" button in the wizard header
2. The slide-over should open

**Expected:**
- Default tab is "What They Need to Do" (NOT "Project Context")
- 5 tabs visible in this order:
  1. "What They Need to Do" (blue) — contains SYS_09, SYS_10, SYS_11, SYS_12 responses
  2. "The System / Change" (green) — contains SYS_01–04 (About the System) and SYS_05–08 (Business Justification)
  3. "Who's Learning" (amber) — contains SHARED_06–11 (Who Will Use This System)
  4. "Constraints & Environment" (red) — contains SHARED_12–14 (Rollout Plan) and SHARED_15–22 (Training Constraints)
  5. "Project & Stakeholders" (blue) — contains SHARED_01–05 (Project Context), SHARED_23–24 (SMEs), SHARED_25–27 (Concerns)

**Screenshot:** Take a screenshot of each tab. Flag if:
- Any tab is missing
- Questions appear under the wrong tab
- Any tab shows no data when it should have responses

## Test 3: Content Priority — Screen 2

**Steps:**
1. Click "Continue →" to advance to Screen 2 (Content Priority)

**Expected:**
- Column headers read "Must Have" / "Should Have" / "Nice to Have" (not "Must" / "Should")
- Each column has always-visible coaching text with:
  - What goes here (criteria)
  - Why it matters (consequence)  
  - Decision question in italics
- Move buttons show arrow + full target label (e.g., "→ Should Have", "→ Nice to Have") not single letters (M/S/N)
- Buttons appear below item text, not inline to the right
- Subtitle reads "Classify tasks by business impact..." not "Only Must and Should proceed to objectives"
- Footer has theory citation (Mager 1997, Moore 2017) with a left accent bar
- Adding a new item defaults to "Should Have" column (not "Must Have")

**Screenshot:** Take a screenshot of Screen 2 with at least one item in each column. Flag if:
- Old M/S/N buttons still appear
- Coaching text is missing or truncated
- Labels still say "Must" / "Should" without "Have"

## Test 4: Terminology Cascade

**Steps:**
1. Navigate to Screen 4 (Objective Builder) — check priority labels on objective cards and in the editor
2. Navigate to Screen 5 (Validation) — check priority breakdown section
3. Navigate to Screen 6 (Export) — check priority labels in grouped objectives

**Expected:**
- All priority references say "Must Have" / "Should Have" / "Nice to Have" everywhere
- No instances of bare "Must" or "Should" as priority labels

**Screenshot:** Take a screenshot of each screen showing priority labels.

## Test 5: Slide-Over Context-Specific Opening

**Steps:**
1. Go to Screen 4 (Objective Builder)
2. If there are any "Needs Analysis Data" buttons in the editor sections (audience, condition, etc.), click them
3. Note which tab the slide-over opens to

**Expected:**
- Audience-related buttons → open to "Who's Learning" tab
- System/condition buttons → open to "The System / Change" tab
- Generic header button → opens to "What They Need to Do" tab

**Screenshot:** Take screenshots if any button opens to the wrong tab.

## Report Format

For each test, report:
- PASS / FAIL
- Screenshot
- If FAIL: what was expected vs. what actually rendered
