'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import BlockEditor from '@/components/editor/BlockEditor';
import NeedsAnalysisView from '@/components/pages/NeedsAnalysisView';
import TaskAnalysisView from '@/components/pages/TaskAnalysisView';
import LearningObjectivesView from '@/components/pages/LearningObjectivesView';
import StoryboardEditor from '@/components/tiptap/StoryboardEditor';
import { PageType } from '@prisma/client';
import { NeedsAnalysisFormData } from '@/lib/types/needsAnalysis';
import { TaskAnalysisFormData } from '@/lib/types/taskAnalysis';
// StoryboardEditor handles its own data fetching internally

interface PageMetadata {
  id: string;
  title: string;
  type: PageType;
  courseId: string;
  workspaceId: string;
}

/**
 * Page view/edit route.
 * Renders the appropriate view based on page type:
 * - NEEDS_ANALYSIS: NeedsAnalysisView with AI analysis panel
 * - All other types: Standard BlockEditor
 */
export default function PageEditorPage() {
  const params = useParams();
  const pageId = params.pageId as string;
  const courseId = params.courseId as string;
  const workspaceId = params.workspaceId as string;

  const [pageMetadata, setPageMetadata] = useState<PageMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsAnalysisData, setNeedsAnalysisData] = useState<Partial<NeedsAnalysisFormData> | null>(null);
  const [taskAnalysisData, setTaskAnalysisData] = useState<Partial<TaskAnalysisFormData> | null>(null);

  useEffect(() => {
    if (!pageId) return;

    const fetchPageMetadata = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/pages/${pageId}`);

        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication required');
            return;
          }
          if (response.status === 404) {
            setError('Page not found');
            return;
          }
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch page');
        }

        const data = await response.json();
        setPageMetadata({
          id: data.id,
          title: data.title,
          type: data.type,
          courseId: data.courseId,
          workspaceId: data.workspaceId,
        });

        // If this is a needs analysis page, fetch the saved data
        if (data.type === 'NEEDS_ANALYSIS') {
          const naResponse = await fetch(`/api/pages/${pageId}/needs-analysis`);
          if (naResponse.ok) {
            const naData = await naResponse.json();
            setNeedsAnalysisData(naData);
          }
        }

        // If this is a task analysis page, fetch the saved data
        if (data.type === 'TASK_ANALYSIS') {
          const taResponse = await fetch(`/api/pages/${pageId}/task-analysis`);
          if (taResponse.ok) {
            const taData = await taResponse.json();
            setTaskAnalysisData(taData);
          }
        }

        // STORYBOARD pages: StoryboardEditor handles its own data fetching
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load page';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageMetadata();
  }, [pageId]);

  // Save handler for needs analysis
  const handleSaveNeedsAnalysis = useCallback(async (data: NeedsAnalysisFormData) => {
    const response = await fetch(`/api/pages/${pageId}/needs-analysis`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save');
    }

    // Update local state with saved data
    const savedData = await response.json();
    setNeedsAnalysisData(savedData);
  }, [pageId]);

  // Save handler for task analysis
  const handleSaveTaskAnalysis = useCallback(async (data: TaskAnalysisFormData) => {
    const response = await fetch(`/api/pages/${pageId}/task-analysis`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save');
    }

    // Update local state with saved data
    const savedData = await response.json();
    setTaskAnalysisData(savedData);
  }, [pageId]);

  if (!pageId) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">Invalid page ID</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading page...</span>
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
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  // Determine which view to render based on page type
  const isNeedsAnalysis = pageMetadata?.type === 'NEEDS_ANALYSIS';
  const isTaskAnalysis = pageMetadata?.type === 'TASK_ANALYSIS';
  const isLearningObjectives = pageMetadata?.type === 'LEARNING_OBJECTIVES';
  const isStoryboard = pageMetadata?.type === 'STORYBOARD';

  // Get badge info based on page type
  const getPageTypeBadge = () => {
    if (isNeedsAnalysis) {
      return { label: 'Needs Analysis', color: 'bg-purple-100 text-purple-700' };
    }
    if (isTaskAnalysis) {
      return { label: 'Task Analysis', color: 'bg-orange-100 text-orange-700' };
    }
    if (isLearningObjectives) {
      return { label: 'Learning Objectives', color: 'bg-blue-100 text-blue-700' };
    }
    if (isStoryboard) {
      return { label: 'Storyboard', color: 'bg-pink-100 text-pink-700' };
    }
    return null;
  };

  const badge = getPageTypeBadge();

  // Render the appropriate view component
  const renderPageContent = () => {
    if (isNeedsAnalysis) {
      return (
        <NeedsAnalysisView
          pageId={pageId}
          courseId={courseId}
          initialData={needsAnalysisData ?? undefined}
          onSave={handleSaveNeedsAnalysis}
        />
      );
    }
    if (isTaskAnalysis) {
      return (
        <TaskAnalysisView
          pageId={pageId}
          courseId={courseId}
          initialData={taskAnalysisData ?? undefined}
          onSave={handleSaveTaskAnalysis}
        />
      );
    }
    if (isLearningObjectives) {
      return <LearningObjectivesView pageId={pageId} courseId={courseId} />;
    }
    if (isStoryboard) {
      return (
        <StoryboardEditor
          pageId={pageId}
          courseId={courseId}
          workspaceId={workspaceId}
        />
      );
    }
    return <BlockEditor pageId={pageId} />;
  };

  return (
    <div className="min-h-full flex flex-col">
      {/* Breadcrumb navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/workspace" className="hover:text-blue-600">
            Workspace
          </Link>
          <span>/</span>
          <Link
            href={`/workspace/${workspaceId}/course/${courseId}`}
            className="hover:text-blue-600"
          >
            Course
          </Link>
          <span>/</span>
          <span className="text-gray-900">{pageMetadata?.title || 'Page'}</span>
          {badge && (
            <span className={`ml-2 px-2 py-0.5 text-xs rounded ${badge.color}`}>
              {badge.label}
            </span>
          )}
        </nav>
      </div>

      {/* Page content - full height minus header */}
      <div className="flex-1 overflow-hidden">
        {renderPageContent()}
      </div>
    </div>
  );
}
