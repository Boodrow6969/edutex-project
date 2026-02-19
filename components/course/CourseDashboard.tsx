'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

// ---------- Types ----------

interface CourseData {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  targetGoLive?: string | null;
  dashboardStatuses?: Record<string, string> | null;
  curricula?: Array<{ id: string; name: string }>;
}

interface PageSummary {
  id: string;
  title: string;
  type: string;
  order: number;
  createdAt: string;
}

interface ObjectiveStats {
  total: number;
  byBloomLevel: Record<string, number>;
  recentObjectives: unknown[];
}

interface TaskStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string | null;
  priority: string;
  status: string;
}

interface OverviewResponse {
  course: CourseData;
  pages: PageSummary[];
  objectiveStats: ObjectiveStats;
  taskStats: TaskStats;
  upcomingTasks: UpcomingTask[];
}

interface StakeholderSubmission {
  id: string;
  trainingType: string | null;
  status: string;
  stakeholderName: string | null;
  stakeholderEmail: string | null;
  responseCount: number;
  totalQuestions: number;
}

type CardStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';

// ---------- Constants ----------

const STATUS_STYLES: Record<CardStatus, { label: string; bg: string; text: string }> = {
  NOT_STARTED: { label: 'Not Started', bg: 'bg-gray-100', text: 'text-gray-700' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-amber-100', text: 'text-amber-700' },
  COMPLETE: { label: 'Complete', bg: 'bg-green-100', text: 'text-green-700' },
};

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const BLOOM_COLORS: Record<string, string> = {
  REMEMBER: 'bg-slate-100 text-slate-700',
  UNDERSTAND: 'bg-blue-100 text-blue-700',
  APPLY: 'bg-green-100 text-green-700',
  ANALYZE: 'bg-yellow-100 text-yellow-700',
  EVALUATE: 'bg-orange-100 text-orange-700',
  CREATE: 'bg-purple-100 text-purple-700',
};

const INTERVENTION_STYLES: Record<string, string> = {
  Training: 'bg-blue-100 text-blue-700',
  'Job Aid': 'bg-teal-100 text-teal-700',
  'Process Change': 'bg-purple-100 text-purple-700',
};

const TRAINING_TYPE_LABELS: Record<string, string> = {
  PERFORMANCE_PROBLEM: 'Performance Problem',
  NEW_SYSTEM: 'New System',
  COMPLIANCE: 'Compliance',
  ROLE_CHANGE: 'Role Change',
};

const APPROVAL_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  APPROVED: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700' },
  PENDING_REVIEW: { label: 'Pending Review', bg: 'bg-amber-100', text: 'text-amber-700' },
  SUBMITTED: { label: 'Pending Review', bg: 'bg-amber-100', text: 'text-amber-700' },
  UNDER_REVIEW: { label: 'Pending Review', bg: 'bg-amber-100', text: 'text-amber-700' },
  REVISION_REQUESTED: { label: 'Revision Requested', bg: 'bg-orange-100', text: 'text-orange-700' },
  DRAFT: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-700' },
};

// ---------- Props ----------

interface CourseDashboardProps {
  courseId: string;
  workspaceId: string;
}

// ---------- Component ----------

export default function CourseDashboard({ courseId, workspaceId }: CourseDashboardProps) {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [submissions, setSubmissions] = useState<StakeholderSubmission[]>([]);
  const [workspaceName, setWorkspaceName] = useState<string>('Workspace');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manual status overrides
  const [statusOverrides, setStatusOverrides] = useState<Record<string, CardStatus>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, submissionsRes, workspaceRes] = await Promise.all([
          fetch(`/api/courses/${courseId}/overview`),
          fetch(`/api/stakeholder/submissions?workspaceId=${workspaceId}`),
          fetch(`/api/workspaces/${workspaceId}`),
        ]);

        if (!overviewRes.ok) throw new Error('Failed to load course data');
        const overviewData = await overviewRes.json();
        setOverview(overviewData);

        // Initialize status overrides from saved dashboard statuses
        if (overviewData.course?.dashboardStatuses) {
          const saved = overviewData.course.dashboardStatuses as Record<string, string>;
          const mapped: Record<string, CardStatus> = {};
          for (const [key, value] of Object.entries(saved)) {
            if (value === 'Not Started') mapped[key] = 'NOT_STARTED';
            else if (value === 'In Progress') mapped[key] = 'IN_PROGRESS';
            else if (value === 'Complete') mapped[key] = 'COMPLETE';
          }
          setStatusOverrides(mapped);
        }

        if (submissionsRes.ok) {
          const subData = await submissionsRes.json();
          setSubmissions(Array.isArray(subData) ? subData : []);
        }

        if (workspaceRes.ok) {
          const wsData = await workspaceRes.json();
          setWorkspaceName(wsData.name || 'Workspace');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId, workspaceId]);

  // ---------- Status helpers ----------

  function getAutoStatus(hasData: boolean): CardStatus {
    return hasData ? 'IN_PROGRESS' : 'NOT_STARTED';
  }

  function getCardStatus(cardKey: string, hasData: boolean): CardStatus {
    return statusOverrides[cardKey] || getAutoStatus(hasData);
  }

  function hasPageOfType(type: string): boolean {
    return overview?.pages.some((p) => p.type === type) ?? false;
  }

  // ---------- Computed data ----------

  const course = overview?.course;
  const trainingType = submissions.length > 0
    ? submissions[0].trainingType
    : null;

  const bestApprovalStatus = submissions.length > 0
    ? submissions.find((s) => s.status === 'APPROVED')?.status
      || submissions.find((s) => s.status === 'UNDER_REVIEW' || s.status === 'SUBMITTED')?.status
      || submissions[0].status
    : null;

  // Days remaining
  const deadline = course?.targetGoLive ? new Date(course.targetGoLive) : null;
  const daysRemaining = deadline
    ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Curriculum info
  const curricula = course?.curricula || [];

  // Upcoming tasks
  const upcomingTasks = overview?.upcomingTasks || [];

  const basePath = `/workspace/${workspaceId}/course/${courseId}`;

  // ---------- Render helpers ----------

  function StatusBadge({ status }: { status: CardStatus }) {
    const s = STATUS_STYLES[status];
    return (
      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  }

  function GearDropdown({ cardKey, hasData }: { cardKey: string; hasData: boolean }) {
    const isOpen = openDropdown === cardKey;
    const currentStatus = getCardStatus(cardKey, hasData);

    return (
      <div className="relative" ref={isOpen ? dropdownRef : undefined}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpenDropdown(isOpen ? null : cardKey);
          }}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          title="Override status"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
            {(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETE'] as CardStatus[]).map((s) => (
              <button
                key={s}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newOverrides = { ...statusOverrides, [cardKey]: s };
                  setStatusOverrides(newOverrides);
                  setOpenDropdown(null);
                  // Persist to server (fire and forget)
                  const apiStatuses: Record<string, string> = {};
                  for (const [k, v] of Object.entries(newOverrides)) {
                    apiStatuses[k] = STATUS_STYLES[v].label;
                  }
                  fetch(`/api/courses/${courseId}/dashboard-statuses`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(apiStatuses),
                  }).catch((err) => console.error('Failed to save status:', err));
                }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                  currentStatus === s ? 'font-semibold' : ''
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${STATUS_STYLES[s].bg.replace('100', '500')}`} />
                {STATUS_STYLES[s].label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------- Loading / Error ----------

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error || 'Failed to load course data'}
        </div>
      </div>
    );
  }

  // ---------- Main Render ----------

  return (
    <div className="min-h-full">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/workspace" className="hover:text-blue-600">Workspaces</Link>
          <span>/</span>
          <Link href={`/workspace/${workspaceId}`} className="hover:text-blue-600">
            {workspaceName}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{course?.name || 'Course'}</span>
        </nav>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* ===== HEADER BANNER ===== */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course?.name}</h1>
              {course?.description && (
                <p className="text-sm text-gray-500 mt-1">{course.description}</p>
              )}
            </div>
            {trainingType && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 shrink-0">
                {TRAINING_TYPE_LABELS[trainingType] || trainingType}
              </span>
            )}
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
            <span>
              Created {new Date(course!.createdAt).toLocaleDateString()}
            </span>
            {deadline && daysRemaining !== null ? (
              <span className="flex items-center gap-1.5">
                Deadline {deadline.toLocaleDateString()}
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    daysRemaining <= 14
                      ? 'bg-red-100 text-red-700'
                      : daysRemaining <= 30
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {daysRemaining}d remaining
                </span>
              </span>
            ) : (
              <span className="text-gray-400">No deadline set</span>
            )}
            <span className="text-gray-400">|</span>
            {curricula.length > 0 ? (
              <Link href={`/workspace/${workspaceId}`} className="text-blue-600 hover:text-blue-800">
                {curricula[0].name}
              </Link>
            ) : (
              <span>Standalone Course</span>
            )}
          </div>

          {/* Next Tasks strip */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Next Tasks</h3>
              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                View All →
              </button>
            </div>
            {upcomingTasks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {upcomingTasks.map((task) => {
                  const priorityKey = (task.priority === 'URGENT' || task.priority === 'HIGH')
                    ? 'high'
                    : task.priority === 'MEDIUM'
                      ? 'medium'
                      : 'low';
                  const daysUntilDue = task.dueDate
                    ? Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        disabled
                        className="mt-0.5 rounded border-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${PRIORITY_STYLES[priorityKey]}`}
                          >
                            {priorityKey}
                          </span>
                          <span className="text-xs text-gray-500">
                            {daysUntilDue !== null ? `${daysUntilDue}d` : 'No due date'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No tasks yet</p>
            )}
          </div>
        </div>

        {/* ===== ANALYSIS SECTION ===== */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Analysis</h2>
            <p className="text-sm text-gray-500">Stakeholder research and needs assessment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Needs Analysis Card */}
            <DashboardCard
              cardKey="needs-analysis"
              title="Needs Analysis"
              icon={<NeedsAnalysisIcon />}
              href={`${basePath}/analysis`}
              status={getCardStatus('needs-analysis', submissions.length > 0)}
              hasData={submissions.length > 0}
              gearDropdown={
                <GearDropdown cardKey="needs-analysis" hasData={submissions.length > 0} />
              }
            >
              {submissions.length > 0 ? (
                <div className="space-y-2">
                  {trainingType && (
                    <p className="text-sm text-gray-600">
                      Type: <span className="font-medium">{TRAINING_TYPE_LABELS[trainingType] || trainingType}</span>
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                  </p>
                  {bestApprovalStatus && APPROVAL_STYLES[bestApprovalStatus] && (
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${APPROVAL_STYLES[bestApprovalStatus].bg} ${APPROVAL_STYLES[bestApprovalStatus].text}`}>
                      {APPROVAL_STYLES[bestApprovalStatus].label}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No submissions yet</p>
              )}
            </DashboardCard>

            {/* Stakeholders Card */}
            <DashboardCard
              cardKey="stakeholders"
              title="Stakeholders"
              icon={<StakeholdersIcon />}
              href={`${basePath}/analysis?tab=stakeholders`}
              status={getCardStatus('stakeholders', submissions.length > 0)}
              hasData={submissions.length > 0}
              gearDropdown={
                <GearDropdown cardKey="stakeholders" hasData={submissions.length > 0} />
              }
            >
              {submissions.length > 0 ? (
                <div className="space-y-1.5">
                  {submissions.slice(0, 3).map((sub) => (
                    <div key={sub.id} className="text-sm text-gray-600">
                      <span className="font-medium">{sub.stakeholderName || 'Unknown'}</span>
                      {sub.stakeholderEmail && (
                        <span className="text-gray-400 ml-1">({sub.stakeholderEmail})</span>
                      )}
                    </div>
                  ))}
                  {submissions.length > 3 && (
                    <p className="text-xs text-gray-400">+{submissions.length - 3} more</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No stakeholders yet</p>
              )}
            </DashboardCard>
          </div>
        </section>

        {/* ===== DESIGN SECTION ===== */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Design</h2>
            <p className="text-sm text-gray-500">Course structure and content development</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Learning Objectives Card */}
            <DashboardCard
              cardKey="objectives"
              title="Learning Objectives"
              icon={<ObjectivesIcon />}
              href={`${basePath}/objectives`}
              status={getCardStatus('objectives', (overview.objectiveStats?.total ?? 0) > 0)}
              hasData={(overview.objectiveStats?.total ?? 0) > 0}
              gearDropdown={
                <GearDropdown cardKey="objectives" hasData={(overview.objectiveStats?.total ?? 0) > 0} />
              }
            >
              {overview.objectiveStats?.total > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{overview.objectiveStats.total} objective{overview.objectiveStats.total !== 1 ? 's' : ''}</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(overview.objectiveStats.byBloomLevel)
                      .filter(([, count]) => count > 0)
                      .map(([level, count]) => (
                        <span
                          key={level}
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${BLOOM_COLORS[level] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {level.charAt(0) + level.slice(1).toLowerCase()} ({count})
                        </span>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No objectives defined yet</p>
              )}
            </DashboardCard>

            {/* Task Analysis Card */}
            <DashboardCard
              cardKey="task-analysis"
              title="Task Analysis"
              icon={<TaskAnalysisIcon />}
              href={`${basePath}/task-analysis`}
              status={getCardStatus('task-analysis', (overview.taskStats?.total ?? 0) > 0)}
              hasData={(overview.taskStats?.total ?? 0) > 0}
              gearDropdown={
                <GearDropdown cardKey="task-analysis" hasData={(overview.taskStats?.total ?? 0) > 0} />
              }
            >
              {overview.taskStats?.total > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{overview.taskStats.total} task{overview.taskStats.total !== 1 ? 's' : ''}</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(INTERVENTION_STYLES).map(([label, style]) => (
                      <span
                        key={label}
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${style}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No tasks analyzed yet</p>
              )}
            </DashboardCard>

            {/* Storyboard Card */}
            <DashboardCard
              cardKey="storyboard"
              title="Storyboard"
              icon={<StoryboardIcon />}
              href={`${basePath}/storyboard`}
              status={getCardStatus('storyboard', hasPageOfType('STORYBOARD'))}
              hasData={hasPageOfType('STORYBOARD')}
              gearDropdown={
                <GearDropdown cardKey="storyboard" hasData={hasPageOfType('STORYBOARD')} />
              }
            >
              {hasPageOfType('STORYBOARD') ? (
                <p className="text-sm text-gray-600">
                  {overview.pages.filter((p) => p.type === 'STORYBOARD').length} screen{overview.pages.filter((p) => p.type === 'STORYBOARD').length !== 1 ? 's' : ''}
                </p>
              ) : (
                <p className="text-sm text-gray-400">No screens created yet</p>
              )}
            </DashboardCard>

            {/* Job Aids Card */}
            <DashboardCard
              cardKey="job-aids"
              title="Job Aids"
              icon={<JobAidsIcon />}
              href={`${basePath}/job-aids`}
              status={getCardStatus('job-aids', false)}
              hasData={false}
              gearDropdown={<GearDropdown cardKey="job-aids" hasData={false} />}
            >
              <p className="text-sm text-gray-400">No job aids created yet</p>
            </DashboardCard>

            {/* Assessment Plan Card */}
            <DashboardCard
              cardKey="assessment"
              title="Assessment Plan"
              icon={<AssessmentIcon />}
              href={`${basePath}/assessment`}
              status={getCardStatus('assessment', hasPageOfType('ASSESSMENT_PLAN'))}
              hasData={hasPageOfType('ASSESSMENT_PLAN')}
              gearDropdown={
                <GearDropdown cardKey="assessment" hasData={hasPageOfType('ASSESSMENT_PLAN')} />
              }
            >
              {hasPageOfType('ASSESSMENT_PLAN') ? (
                <p className="text-sm text-gray-600">
                  {overview.pages.filter((p) => p.type === 'ASSESSMENT_PLAN').length} assessment{overview.pages.filter((p) => p.type === 'ASSESSMENT_PLAN').length !== 1 ? 's' : ''}
                </p>
              ) : (
                <p className="text-sm text-gray-400">No assessments planned yet</p>
              )}
            </DashboardCard>

            {/* Evaluation Plan Card */}
            <DashboardCard
              cardKey="evaluation"
              title="Evaluation Plan"
              icon={<EvaluationIcon />}
              href={`${basePath}/evaluation`}
              status={getCardStatus('evaluation', false)}
              hasData={false}
              gearDropdown={<GearDropdown cardKey="evaluation" hasData={false} />}
            >
              <p className="text-sm text-gray-400">No evaluation metrics defined yet</p>
            </DashboardCard>
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------- DashboardCard ----------

interface DashboardCardProps {
  cardKey: string;
  title: string;
  icon: React.ReactNode;
  href: string;
  status: CardStatus;
  hasData: boolean;
  gearDropdown: React.ReactNode;
  children: React.ReactNode;
}

function DashboardCard({ title, icon, href, status, gearDropdown, children }: DashboardCardProps) {
  const s = STATUS_STYLES[status];

  return (
    <Link
      href={href}
      className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-150 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <span className={`inline-block mt-0.5 px-2 py-0.5 text-xs font-medium rounded-full ${s.bg} ${s.text}`}>
              {s.label}
            </span>
          </div>
        </div>
        {gearDropdown}
      </div>

      {/* Body */}
      <div className="mb-3">{children}</div>

      {/* Footer */}
      <div className="text-xs font-medium text-blue-600 group-hover:text-blue-800 transition-colors">
        View Details →
      </div>
    </Link>
  );
}

// ---------- Icons (Lucide-style SVG) ----------

function NeedsAnalysisIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}

function StakeholdersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function ObjectivesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  );
}

function TaskAnalysisIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  );
}

function StoryboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function JobAidsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function AssessmentIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
    </svg>
  );
}

function EvaluationIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}
