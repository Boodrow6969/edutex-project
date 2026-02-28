'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ObjectivesWizard from './ObjectivesWizard';
import type { WizardObjective, TriageItemData, SubTaskData, NASummary, NASection } from './types';
import { getTabsForTrainingType } from './constants';
import { QUESTION_MAP } from '@/lib/questions';
import type { StakeholderSubmissionDisplay, CourseAnalysisFormData } from '@/lib/types/courseAnalysis';

interface WizardData {
  objectives: WizardObjective[];
  triageItems: TriageItemData[];
  subTasks: SubTaskData[];
  gapKnowledge: boolean;
  gapSkill: boolean;
  naSummary: NASummary | null;
  naSections: NASection[];
  audiences: string[];
  courseName: string;
}

export default function ObjectivesPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const workspaceId = params.workspaceId as string;
  const [data, setData] = useState<WizardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWizardData() {
      try {
        // Fetch all wizard data in parallel
        const [courseRes, contextRes, objectivesRes, triageRes, gapRes] = await Promise.all([
          fetch(`/api/courses/${courseId}/overview`),
          fetch(`/api/courses/${courseId}/analysis-context`),
          fetch(`/api/courses/${courseId}/objectives`),
          fetch(`/api/courses/${courseId}/triage-items`),
          fetch(`/api/courses/${courseId}/gap`),
        ]);

        if (!courseRes.ok) throw new Error('Failed to load course data');

        const courseData = await courseRes.json();
        const contextData = contextRes.ok ? await contextRes.json() : null;
        const objectivesData = objectivesRes.ok ? await objectivesRes.json() : [];
        const triageData = triageRes.ok ? await triageRes.json() : [];
        const gapData = gapRes.ok ? await gapRes.json() : { gapKnowledge: false, gapSkill: false };

        // Transform objectives from DB format to wizard format
        const objectives: WizardObjective[] = (Array.isArray(objectivesData) ? objectivesData : []).map(
          (o: Record<string, unknown>) => ({
            id: o.id as string,
            audience: (o.audience as string) || '',
            behavior: (o.title as string) || '', // title = behavior
            verb: (o.verb as string) || '',
            bloomLevel: mapBloomLevel(o.bloomLevel as string),
            bloomKnowledge: mapBloomKnowledge(o.bloomKnowledge as string),
            condition: (o.condition as string) || '',
            criteria: (o.criteria as string) || '',
            freeformText: (o.freeformText as string) || '',
            priority: mapPriority(o.objectivePriority as string),
            requiresAssessment: (o.requiresAssessment as boolean) || false,
            rationale: (o.rationale as string) || '',
            wiifm: (o.wiifm as string) || '',
            linkedTaskId: (o.linkedTriageItemId as string) || null,
            sortOrder: (o.sortOrder as number) || 0,
          })
        );

        // Extract sub-tasks from triage items (they come with include)
        const triageItems: TriageItemData[] = (Array.isArray(triageData) ? triageData : []).map(
          (t: Record<string, unknown>) => ({
            id: t.id as string,
            courseId: t.courseId as string,
            text: t.text as string,
            column: t.column as TriageItemData['column'],
            source: t.source as TriageItemData['source'],
            sortOrder: (t.sortOrder as number) || 0,
          })
        );

        const subTasks: SubTaskData[] = (Array.isArray(triageData) ? triageData : []).flatMap(
          (t: Record<string, unknown>) =>
            ((t.subTasks as Record<string, unknown>[]) || []).map((s) => ({
              id: s.id as string,
              parentItemId: s.parentItemId as string,
              text: (s.text as string) || '',
              isNew: (s.isNew as SubTaskData['isNew']) || 'New',
              sortOrder: (s.sortOrder as number) || 0,
            }))
        );

        // Build NA data from analysis-context + overview
        const course = courseData.course || courseData;
        const naSummary = buildNASummary(contextData, course);
        const naSections = buildNASections(contextData, course);
        const audiences = extractAudiences(contextData);

        setData({
          objectives,
          triageItems,
          subTasks,
          gapKnowledge: gapData.gapKnowledge || false,
          gapSkill: gapData.gapSkill || false,
          naSummary,
          naSections,
          audiences,
          courseName: course.name || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wizard data');
      } finally {
        setIsLoading(false);
      }
    }

    loadWizardData();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#03428e] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading Learning Objectives...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <Link
            href={`/workspace/${workspaceId}/course/${courseId}`}
            className="inline-block mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Back to Course Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ObjectivesWizard
        courseId={courseId}
        courseName={data.courseName}
        initialObjectives={data.objectives}
        initialTriageItems={data.triageItems}
        initialSubTasks={data.subTasks}
        initialGap={{ knowledge: data.gapKnowledge, skill: data.gapSkill }}
        naSummary={data.naSummary}
        naSections={data.naSections}
        audiences={data.audiences}
      />
    </div>
  );
}

// ─── Helper functions ───

function mapBloomLevel(level: string | null | undefined): WizardObjective['bloomLevel'] {
  if (!level) return '';
  const map: Record<string, WizardObjective['bloomLevel']> = {
    REMEMBER: 'Remember',
    UNDERSTAND: 'Understand',
    APPLY: 'Apply',
    ANALYZE: 'Analyze',
    EVALUATE: 'Evaluate',
    CREATE: 'Create',
  };
  return map[level] || '';
}

function mapBloomKnowledge(knowledge: string | null | undefined): WizardObjective['bloomKnowledge'] {
  if (!knowledge) return '';
  const map: Record<string, WizardObjective['bloomKnowledge']> = {
    FACTUAL: 'Factual',
    CONCEPTUAL: 'Conceptual',
    PROCEDURAL: 'Procedural',
    METACOGNITIVE: 'Metacognitive',
  };
  return map[knowledge] || '';
}

function mapPriority(priority: string | null | undefined): WizardObjective['priority'] {
  if (!priority) return 'Should Have';
  const map: Record<string, WizardObjective['priority']> = {
    MUST: 'Must Have',
    SHOULD: 'Should Have',
    NICE_TO_HAVE: 'Nice to Have',
  };
  return map[priority] || 'Should Have';
}

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

/**
 * Find the first response matching a question ID across all submissions.
 * Returns the response value or empty string.
 */
function getSubmissionResponse(
  submissions: StakeholderSubmissionDisplay[],
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

function buildNASummary(
  contextData: Record<string, unknown> | null,
  course: Record<string, unknown>
): NASummary | null {
  if (!contextData) return null;

  const ca = contextData.courseAnalysis as CourseAnalysisFormData | undefined;
  const submissions = (contextData.submissions as StakeholderSubmissionDisplay[]) || [];
  const trainingType = (course.courseType as string) || '';
  const labels = getSummaryLabels(trainingType);

  // Format training type for display
  const trainingTypeDisplay = trainingType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  // Build audience string
  const audiences = ca?.audiences || [];
  let audienceStr = '';
  if (audiences.length > 0) {
    audienceStr = audiences.map(a => a.role).join(', ');
  } else {
    audienceStr = getSubmissionResponse(submissions, 'SHARED_06');
  }
  if (!audienceStr) {
    audienceStr = (ca?.learnerPersonas || []).join(', ');
  }

  // Build pain points
  const painPoints: string[] = [];
  const concerns = getSubmissionResponse(submissions, 'SHARED_25');
  if (concerns) {
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

function buildNASections(
  contextData: Record<string, unknown> | null,
  course: Record<string, unknown>
): NASection[] {
  if (!contextData) {
    return [
      {
        key: 'project',
        title: 'Project Context',
        color: '#3b82f6',
        items: [{ q: 'Status', a: 'No Needs Analysis data available.' }],
      },
    ];
  }

  const trainingType = (course.courseType as string) || '';
  const tabConfig = getTabsForTrainingType(trainingType);
  const submissions = (contextData.submissions as StakeholderSubmissionDisplay[]) || [];
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

  // Add courseAnalysis supplementary data to relevant tabs
  if (ca?.problemSummary) {
    tabItems['system']?.push({ q: 'ID Analysis: Problem Summary', a: ca.problemSummary, order: 0 });
  }
  if (ca?.solutionRationale) {
    tabItems['system']?.push({ q: 'ID Analysis: Solution Rationale', a: ca.solutionRationale, order: 1 });
  }
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

function extractAudiences(contextData: Record<string, unknown> | null): string[] {
  if (!contextData) return ['All learners'];
  const ca = contextData.courseAnalysis as Record<string, unknown> | undefined;
  if (!ca) return ['All learners'];

  const audiences = (ca.audiences as Record<string, unknown>[]) || [];
  if (audiences.length > 0) {
    return audiences.map((a) => {
      const role = (a.role as string) || '';
      const headcount = (a.headcount as string) || '';
      return headcount ? `${role} (~${headcount})` : role;
    });
  }

  const personas = (ca.learnerPersonas as string[]) || [];
  return personas.length > 0 ? personas : ['All learners'];
}
