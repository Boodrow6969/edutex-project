'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageType, BloomLevel, TaskStatus } from '@prisma/client';
import PagesList from './PagesList';
import ObjectivesSummary from './ObjectivesSummary';
import TasksSummary from './TasksSummary';
import CurriculaSelector from '@/components/ui/CurriculaSelector';

interface PageSummary {
  id: string;
  title: string;
  type: PageType;
  order: number;
  createdAt: string;
}

interface ObjectiveStats {
  total: number;
  byBloomLevel: Record<BloomLevel, number>;
  recentObjectives: Array<{
    id: string;
    title: string;
    bloomLevel: BloomLevel;
    createdAt: string;
  }>;
}

interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
}

interface ProjectOverviewData {
  project: {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    workspaceId: string;
  };
  pages: PageSummary[];
  objectiveStats: ObjectiveStats;
  taskStats: TaskStats;
}

interface ProjectOverviewProps {
  projectId: string;
  workspaceId: string;
  onCreatePage: () => void;
}

const PAGE_TYPE_LABELS: Record<PageType, string> = {
  CUSTOM: 'Custom',
  NEEDS_ANALYSIS: 'Needs Analysis',
  TASK_ANALYSIS: 'Task Analysis',
  AUDIENCE_PROFILE: 'Audience Profile',
  LEARNING_OBJECTIVES: 'Learning Objectives',
  ASSESSMENT_PLAN: 'Assessment Plan',
  STORYBOARD: 'Storyboard',
  CURRICULUM_MAP: 'Curriculum Map',
  PROGRAM_NEEDS_ANALYSIS: 'Program Needs Analysis',
  PROGRAM_MAP: 'Program Map',
  PROGRAM_ASSESSMENT_STRATEGY: 'Program Assessment Strategy',
  PROGRAM_EVALUATION: 'Program Evaluation',
};

/**
 * Main project overview component that fetches and displays project summary data.
 */
export default function ProjectOverview({
  projectId,
  workspaceId,
  onCreatePage,
}: ProjectOverviewProps) {
  const [data, setData] = useState<ProjectOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/projects/${projectId}/overview`);

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required');
          return;
        }
        if (response.status === 404) {
          setError('Project not found');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch project overview');
      }

      const overview = await response.json();
      setData(overview);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load project';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Allow refreshing from parent when pages are created
  const refreshOverview = useCallback(() => {
    fetchOverview();
  }, [fetchOverview]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading project...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchOverview}
          className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Project Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{data.project.name}</h1>
            {data.project.description && (
              <p className="mt-2 text-gray-600">{data.project.description}</p>
            )}
            <p className="mt-3 text-sm text-gray-500">
              Created {formatDate(data.project.createdAt)}
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-6 ml-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{data.pages.length}</div>
              <div className="text-xs text-gray-500">Pages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.objectiveStats.total}</div>
              <div className="text-xs text-gray-500">Objectives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.taskStats.total}</div>
              <div className="text-xs text-gray-500">Tasks</div>
            </div>
          </div>
        </div>

        {/* Part of Curricula */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="text-sm font-medium text-gray-700 block mb-1">Part of Curricula</label>
          <p className="text-xs text-gray-500 mb-2">This course is included in the following curricula</p>
          <CurriculaSelector
            projectId={projectId}
            workspaceId={workspaceId}
          />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pages list - spans 2 columns on large screens */}
        <div className="lg:col-span-2">
          <PagesList
            pages={data.pages}
            workspaceId={workspaceId}
            projectId={projectId}
            onCreatePage={onCreatePage}
          />
        </div>

        {/* Side column for summaries */}
        <div className="space-y-6">
          <ObjectivesSummary stats={data.objectiveStats} />
          <TasksSummary stats={data.taskStats} />
        </div>
      </div>
    </div>
  );
}

// Export a hook for parent components to trigger refresh
export function useProjectOverviewRefresh() {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  return { refreshKey, triggerRefresh };
}
