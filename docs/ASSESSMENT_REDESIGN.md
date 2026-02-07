# Redesign Assessment Block in Storyboard ContentScreen

The current Assessment screenType has granular quiz-question fields (questionType, questionText, answerOptions, points) that belong in Quiz Builder, not the storyboard. Replace with high-level instructional design fields grounded in learning theory.

## Step 1: Update ContentScreenNode.ts — Remove old, add new attributes

REMOVE these attributes:
- questionType
- questionText
- answerOptions
- points

ADD these attributes (all inside addAttributes()):

```typescript
// Assessment type fields (redesigned)
assessmentPurpose: { default: '' },
assessmentFormat: { default: '' },
assessmentFormatOther: { default: '' },
linkedObjectiveIds: { default: [] },
cognitiveDemand: { default: '' },
assessmentRationale: { default: [] },
assessmentRationaleOther: { default: '' },
estimatedDuration: { default: '' },
attemptsAllowed: { default: '1' },
gradedWeighted: { default: '' },
dynamicScopeValue: { default: '' },
feedbackStrategy: { default: '' },
passingCriteria: { default: '' },
```

Also remove the old assessment fields from the `insertContentScreen` command defaults if present.

## Step 2: Update sync.ts — Both directions

In the `blockToNode` function (CONTENT_SCREEN case), REMOVE:

```
questionType, questionText, answerOptions, points
```

REPLACE with:

```typescript
// Assessment type fields
assessmentPurpose: getString(blockContent, 'assessmentPurpose'),
assessmentFormat: getString(blockContent, 'assessmentFormat'),
assessmentFormatOther: getString(blockContent, 'assessmentFormatOther'),
linkedObjectiveIds: blockContent.linkedObjectiveIds || [],
cognitiveDemand: getString(blockContent, 'cognitiveDemand'),
assessmentRationale: blockContent.assessmentRationale || [],
assessmentRationaleOther: getString(blockContent, 'assessmentRationaleOther'),
estimatedDuration: getString(blockContent, 'estimatedDuration'),
attemptsAllowed: getString(blockContent, 'attemptsAllowed') || '1',
gradedWeighted: getString(blockContent, 'gradedWeighted'),
dynamicScopeValue: getString(blockContent, 'dynamicScopeValue'),
feedbackStrategy: getString(blockContent, 'feedbackStrategy'),
passingCriteria: getString(blockContent, 'passingCriteria'),
```

In the `nodeToBlock` function (contentScreen case), REMOVE:

```
questionType, questionText, answerOptions, points
```

REPLACE with:

```typescript
// Assessment type fields
assessmentPurpose: (node.attrs?.assessmentPurpose as string) || '',
assessmentFormat: (node.attrs?.assessmentFormat as string) || '',
assessmentFormatOther: (node.attrs?.assessmentFormatOther as string) || '',
linkedObjectiveIds: node.attrs?.linkedObjectiveIds || [],
cognitiveDemand: (node.attrs?.cognitiveDemand as string) || '',
assessmentRationale: node.attrs?.assessmentRationale || [],
assessmentRationaleOther: (node.attrs?.assessmentRationaleOther as string) || '',
estimatedDuration: (node.attrs?.estimatedDuration as string) || '',
attemptsAllowed: (node.attrs?.attemptsAllowed as string) || '1',
gradedWeighted: (node.attrs?.gradedWeighted as string) || '',
dynamicScopeValue: (node.attrs?.dynamicScopeValue as string) || '',
feedbackStrategy: (node.attrs?.feedbackStrategy as string) || '',
passingCriteria: (node.attrs?.passingCriteria as string) || '',
```

## Step 3: Update blocks.ts — ContentScreenContent interface

REMOVE from ContentScreenContent interface any references to:

```
questionType, questionText, answerOptions, points
```

No need to add the new fields here since ContentScreenContent already has a generic screenType and these fields live in the JSON content blob. But if you want strict typing, add them.

Also REMOVE the QuestionType-related types if they exist only for assessment (keep ActivityType for Practice block).

## Step 4: Replace AssessmentFields component in ContentScreenComponent.tsx

REMOVE the old AssessmentFields component entirely (the one with questionType dropdown, questionText textarea, answer options with add/remove, points input).

REMOVE the `QuestionType` type alias and `QUESTION_TYPE_OPTIONS` constant.

REMOVE the `AnswerOption` interface.

REPLACE with this new AssessmentFields component:

```tsx
// Assessment option constants
const ASSESSMENT_PURPOSE_OPTIONS = [
  { value: 'diagnostic', label: 'Diagnostic (Pre-Assessment)' },
  { value: 'formative_knowledge_check', label: 'Formative (Knowledge Check)' },
  { value: 'formative_practice', label: 'Formative (Practice Activity)' },
  { value: 'summative_quiz_exam', label: 'Summative (Quiz/Exam)' },
  { value: 'summative_performance', label: 'Summative (Performance Assessment)' },
];

const ASSESSMENT_FORMAT_OPTIONS = [
  { value: 'quiz', label: 'Quiz' },
  { value: 'exam', label: 'Exam' },
  { value: 'scenario_based', label: 'Scenario-Based' },
  { value: 'performance_observation', label: 'Performance/Observation' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'self_assessment', label: 'Self-Assessment' },
  { value: 'peer_review', label: 'Peer Review' },
  { value: 'other', label: 'Other' },
];

const COGNITIVE_DEMAND_OPTIONS = [
  { value: 'recognition', label: 'Recognition (identify/select)' },
  { value: 'recall', label: 'Recall (retrieve/state)' },
  { value: 'application', label: 'Application (use/demonstrate)' },
  { value: 'analysis_evaluation', label: 'Analysis/Evaluation (judge/decide)' },
];

const ASSESSMENT_RATIONALE_OPTIONS = [
  { value: 'retrieval_practice', label: 'Retrieval Practice — strengthen memory through active recall' },
  { value: 'spaced_practice', label: 'Spaced Practice — revisit earlier content at intervals' },
  { value: 'misconception_check', label: 'Misconception Check — surface and correct common errors' },
  { value: 'prerequisite_gate', label: 'Prerequisite Gate — verify readiness before advancing' },
  { value: 'mastery_verification', label: 'Mastery Verification — confirm objective achievement' },
  { value: 'confidence_calibration', label: 'Confidence Calibration — expose gap between perceived and actual knowledge' },
  { value: 'application_transfer', label: 'Application Transfer — test ability to use knowledge in realistic context' },
  { value: 'learner_self_assessment', label: 'Learner Self-Assessment — build metacognitive awareness' },
  { value: 'compliance_certification', label: 'Compliance/Certification — meet regulatory or policy requirement' },
  { value: 'engagement_momentum', label: 'Engagement/Momentum — re-engage attention mid-lesson' },
  { value: 'other', label: 'Other' },
];

const ATTEMPTS_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: 'unlimited', label: 'Unlimited' },
];

const GRADED_OPTIONS = [
  { value: 'graded', label: 'Graded' },
  { value: 'completion_only', label: 'Completion Only' },
  { value: 'ungraded_practice', label: 'Ungraded Practice' },
];

const FEEDBACK_STRATEGY_OPTIONS = [
  { value: 'immediate_corrective', label: 'Immediate Corrective' },
  { value: 'immediate_elaborative', label: 'Immediate Elaborative' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'no_feedback', label: 'No Feedback (Exam Conditions)' },
];

// Dynamic scope field label/placeholder based on format
function getDynamicScopeConfig(format: string): { label: string; placeholder: string } {
  switch (format) {
    case 'quiz':
    case 'exam':
      return { label: 'Estimated Questions', placeholder: 'e.g. 10' };
    case 'scenario_based':
      return { label: 'Decision Points', placeholder: 'e.g. 3' };
    case 'performance_observation':
      return { label: 'Tasks Observed', placeholder: 'e.g. 5' };
    case 'portfolio':
      return { label: 'Artifacts Required', placeholder: 'e.g. 3' };
    case 'self_assessment':
    case 'peer_review':
      return { label: 'Number of Items', placeholder: 'e.g. 8' };
    case 'other':
      return { label: 'Scope Notes', placeholder: 'Describe scope...' };
    default:
      return { label: 'Scope', placeholder: '' };
  }
}

function AssessmentFields({ attrs, updateAttributes }: FieldProps) {
  const assessmentFormat = (attrs.assessmentFormat as string) || '';
  const rationale = Array.isArray(attrs.assessmentRationale) ? attrs.assessmentRationale as string[] : [];
  const dynamicScope = getDynamicScopeConfig(assessmentFormat);

  const toggleRationale = (value: string) => {
    const current = [...rationale];
    const index = current.indexOf(value);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    updateAttributes({ assessmentRationale: current });
  };

  return (
    <div className="p-4 space-y-5">
      {/* Row 1: Purpose + Format */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Assessment Purpose
          </label>
          <select
            value={(attrs.assessmentPurpose as string) || ''}
            onChange={(e) => updateAttributes({ assessmentPurpose: e.target.value })}
            className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
          >
            <option value="">Select purpose...</option>
            {ASSESSMENT_PURPOSE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Assessment Format
          </label>
          <select
            value={assessmentFormat}
            onChange={(e) => updateAttributes({ assessmentFormat: e.target.value, dynamicScopeValue: '' })}
            className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
          >
            <option value="">Select format...</option>
            {ASSESSMENT_FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {assessmentFormat === 'other' && (
            <input
              type="text"
              value={(attrs.assessmentFormatOther as string) || ''}
              onChange={(e) => updateAttributes({ assessmentFormatOther: e.target.value })}
              placeholder="Describe format..."
              className="w-full mt-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
            />
          )}
        </div>
      </div>

      {/* Row 2: Cognitive Demand + Feedback Strategy */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Cognitive Demand
          </label>
          <select
            value={(attrs.cognitiveDemand as string) || ''}
            onChange={(e) => updateAttributes({ cognitiveDemand: e.target.value })}
            className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
          >
            <option value="">Select level...</option>
            {COGNITIVE_DEMAND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Feedback Strategy
          </label>
          <select
            value={(attrs.feedbackStrategy as string) || ''}
            onChange={(e) => updateAttributes({ feedbackStrategy: e.target.value })}
            className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
          >
            <option value="">Select strategy...</option>
            {FEEDBACK_STRATEGY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Scope — Universal fields + dynamic field */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Assessment Scope
        </label>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Est. Duration</label>
            <input
              type="text"
              value={(attrs.estimatedDuration as string) || ''}
              onChange={(e) => updateAttributes({ estimatedDuration: e.target.value })}
              placeholder="e.g. 15 min"
              className="w-full px-2 py-1.5 text-sm text-gray-700 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Attempts</label>
            <select
              value={(attrs.attemptsAllowed as string) || '1'}
              onChange={(e) => updateAttributes({ attemptsAllowed: e.target.value })}
              className="w-full px-2 py-1.5 text-sm text-gray-700 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
            >
              {ATTEMPTS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Grading</label>
            <select
              value={(attrs.gradedWeighted as string) || ''}
              onChange={(e) => updateAttributes({ gradedWeighted: e.target.value })}
              className="w-full px-2 py-1.5 text-sm text-gray-700 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
            >
              <option value="">Select...</option>
              {GRADED_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {assessmentFormat && (
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">{dynamicScope.label}</label>
              {assessmentFormat === 'other' ? (
                <input
                  type="text"
                  value={(attrs.dynamicScopeValue as string) || ''}
                  onChange={(e) => updateAttributes({ dynamicScopeValue: e.target.value })}
                  placeholder={dynamicScope.placeholder}
                  className="w-full px-2 py-1.5 text-sm text-gray-700 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
                />
              ) : (
                <input
                  type="number"
                  min="1"
                  value={(attrs.dynamicScopeValue as string) || ''}
                  onChange={(e) => updateAttributes({ dynamicScopeValue: e.target.value })}
                  placeholder={dynamicScope.placeholder}
                  className="w-full px-2 py-1.5 text-sm text-gray-700 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Passing Criteria */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Passing Criteria
        </label>
        <input
          type="text"
          value={(attrs.passingCriteria as string) || ''}
          onChange={(e) => updateAttributes({ passingCriteria: e.target.value })}
          placeholder="e.g. 80%, All safety items correct, Complete all scenarios"
          className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
        />
      </div>

      {/* Assessment Rationale — Multi-select checkboxes */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Assessment Rationale
          <span className="ml-2 font-normal normal-case tracking-normal text-gray-400">— Why does this assessment point exist here?</span>
        </label>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-gray-50 border border-gray-200 rounded-md p-3">
          {ASSESSMENT_RATIONALE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-start gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rationale.includes(opt.value)}
                onChange={() => toggleRationale(opt.value)}
                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-xs text-gray-600 group-hover:text-gray-800 leading-snug">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
        {rationale.includes('other') && (
          <input
            type="text"
            value={(attrs.assessmentRationaleOther as string) || ''}
            onChange={(e) => updateAttributes({ assessmentRationaleOther: e.target.value })}
            placeholder="Describe other rationale..."
            className="w-full mt-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
          />
        )}
      </div>

      {/* Linked Objectives placeholder */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Linked Objectives
        </label>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-700">
          Objective linking will connect to project objectives (similar to Learning Objectives Import). For now, use Designer Notes to reference which objectives this assessment covers.
        </div>
      </div>
    </div>
  );
}
```

## Step 5: Verify

1. Start dev server: `npm run dev`
2. Open a storyboard page
3. Add a Content Screen block from toolbar
4. Change screenType to Assessment
5. Verify all new fields render: Purpose, Format, Cognitive Demand, Feedback Strategy, Scope row (with dynamic 4th field), Passing Criteria, Rationale checkboxes, Linked Objectives placeholder
6. Select "Other" for Format — verify text field appears
7. Check "Other" in Rationale — verify text field appears
8. Change Format dropdown — verify dynamic scope field label changes
9. Fill in fields, let autosave trigger, refresh page — verify data persists
10. Verify other screenTypes (Content, Video, Practice, Scenario, Title/Intro) still work correctly

## Important Notes

- Do NOT touch any fields for other screenTypes (content, video, practice, scenario, title_intro)
- The Linked Objectives field is a placeholder for now — full implementation will come later
- Keep the shared Designer & Developer Notes collapsible section unchanged
- Existing assessment blocks in the database may have old fields (questionType, etc.) — they will be harmlessly ignored since we're using defaults for all new fields
