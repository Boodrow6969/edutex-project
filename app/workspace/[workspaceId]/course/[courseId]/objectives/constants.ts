// Learning Objectives Wizard — Constants

import type { BloomDef, PriorityDef, StepDef } from './types';

// ─── NA Slide-Over Tab Mapping ───

export interface SlideOverTab {
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

const GENERIC_TABS: SlideOverTab[] = [
  {
    key: 'tasks',
    title: 'What They Need to Do',
    color: '#03428e',
    sourceSections: [],
  },
  {
    key: 'system',
    title: 'The Change',
    color: '#10b981',
    sourceSections: [],
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
    default:
      return GENERIC_TABS;
  }
}

export const BLOOM: BloomDef[] = [
  { level: 'Remember', color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db', fill: '#94a3b8', verbs: ['List', 'Define', 'Identify', 'Name', 'Recall', 'Recognize', 'State', 'Match'] },
  { level: 'Understand', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', fill: '#60a5fa', verbs: ['Describe', 'Summarize', 'Explain', 'Paraphrase', 'Classify', 'Discuss', 'Interpret'] },
  { level: 'Apply', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', fill: '#4ade80', verbs: ['Demonstrate', 'Execute', 'Implement', 'Solve', 'Use', 'Operate', 'Complete'] },
  { level: 'Analyze', color: '#ca8a04', bg: '#fefce8', border: '#fef08a', fill: '#facc15', verbs: ['Compare', 'Contrast', 'Examine', 'Differentiate', 'Categorize', 'Distinguish', 'Determine'] },
  { level: 'Evaluate', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', fill: '#fb923c', verbs: ['Justify', 'Critique', 'Assess', 'Judge', 'Defend', 'Prioritize', 'Recommend'] },
  { level: 'Create', color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff', fill: '#a855f7', verbs: ['Design', 'Develop', 'Construct', 'Compose', 'Formulate', 'Generate', 'Plan'] },
];

export const BLOOM_KNOWLEDGE = ['Factual', 'Conceptual', 'Procedural', 'Metacognitive'] as const;

// Anderson-Krathwohl 2D verb matrix: Process × Knowledge
export const B2V: Record<string, string[]> = {
  'Remember-Factual': ['list', 'identify', 'recall', 'name'],
  'Remember-Conceptual': ['classify', 'categorize'],
  'Remember-Procedural': ['recall steps', 'identify sequence'],
  'Remember-Metacognitive': ['identify strategy'],
  'Understand-Factual': ['describe', 'paraphrase', 'summarize'],
  'Understand-Conceptual': ['explain', 'interpret', 'compare'],
  'Understand-Procedural': ['clarify steps', 'explain process'],
  'Understand-Metacognitive': ['explain strategy'],
  'Apply-Factual': ['respond', 'provide', 'label'],
  'Apply-Conceptual': ['implement', 'carry out', 'use'],
  'Apply-Procedural': ['execute', 'perform', 'complete', 'demonstrate'],
  'Apply-Metacognitive': ['apply strategy'],
  'Analyze-Factual': ['differentiate', 'distinguish', 'select'],
  'Analyze-Conceptual': ['organize', 'attribute', 'compare'],
  'Analyze-Procedural': ['integrate', 'deconstruct', 'troubleshoot'],
  'Analyze-Metacognitive': ['assess own approach'],
  'Evaluate-Factual': ['check', 'verify', 'detect'],
  'Evaluate-Conceptual': ['critique', 'judge', 'justify'],
  'Evaluate-Procedural': ['test', 'monitor', 'evaluate'],
  'Evaluate-Metacognitive': ['reflect', 'self-assess'],
  'Create-Factual': ['generate', 'compile', 'assemble'],
  'Create-Conceptual': ['design', 'construct', 'plan'],
  'Create-Procedural': ['develop procedure', 'devise', 'produce'],
  'Create-Metacognitive': ['create strategy'],
};

export const PRI: PriorityDef[] = [
  { label: 'Must Have', color: '#dc2626', bg: '#fef2f2', dot: '\u{1F534}' },
  { label: 'Should Have', color: '#ca8a04', bg: '#fefce8', dot: '\u{1F7E1}' },
  { label: 'Nice to Have', color: '#6b7280', bg: '#f9fafb', dot: '\u{1F7E2}' },
];

export const STEPS: StepDef[] = [
  { key: 'context', num: '1', label: 'Context & Gap Check' },
  { key: 'priority', num: '2', label: 'Content Priority' },
  { key: 'tasks', num: '3', label: 'Task Breakdown' },
  { key: 'builder', num: '4', label: 'Objective Builder' },
  { key: 'validation', num: '5', label: 'Validation' },
  { key: 'export', num: '6', label: 'Export' },
];

export const STEP_ICONS: Record<string, string> = {
  none: '\u25CB',    // ○
  progress: '\u25D1', // ◑
  done: '\u25CF',    // ●
  skip: '\u2014',    // —
};

export function newObjective(): import('./types').WizardObjective {
  return {
    id: `obj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    audience: '',
    behavior: '',
    verb: '',
    bloomLevel: '',
    bloomKnowledge: '',
    condition: '',
    criteria: '',
    freeformText: '',
    priority: 'Should Have',
    requiresAssessment: false,
    rationale: '',
    wiifm: '',
    linkedTaskId: null,
    sortOrder: 0,
  };
}
