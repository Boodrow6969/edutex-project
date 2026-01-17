'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import BlockEditor from '@/components/editor/BlockEditor';
import { PageType } from '@prisma/client';

interface PageMetadata {
  id: string;
  title: string;
  type: PageType;
  curriculumId: string;
  workspaceId: string;
}

/**
 * Curriculum page view/edit route.
 * Renders the appropriate view based on page type:
 * - PROGRAM_NEEDS_ANALYSIS: Program-level needs analysis
 * - PROGRAM_MAP: Program curriculum map
 * - PROGRAM_ASSESSMENT_STRATEGY: Assessment strategy view
 * - PROGRAM_EVALUATION: Program evaluation view
 * - All other types: Standard BlockEditor
 */
export default function CurriculumPageEditorPage() {
  const params = useParams();
  const pageId = params.pageId as string;
  const curriculumId = params.curriculumId as string;
  const workspaceId = params.workspaceId as string;

  const [pageMetadata, setPageMetadata] = useState<PageMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          curriculumId: data.curriculumId,
          workspaceId: data.workspaceId,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load page';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageMetadata();
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
          <div className="w-6 h-6 border-2 border-[#03428e] border-t-transparent rounded-full animate-spin"></div>
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
            href={`/workspace/${workspaceId}/curriculum/${curriculumId}`}
            className="inline-block mt-4 text-[#03428e] hover:text-[#022d61]"
          >
            Back to Curriculum
          </Link>
        </div>
      </div>
    );
  }

  // Get badge info based on page type
  const getPageTypeBadge = () => {
    const type = pageMetadata?.type;
    switch (type) {
      case 'PROGRAM_NEEDS_ANALYSIS':
        return { label: 'Program Needs Analysis', color: 'bg-purple-100 text-purple-700' };
      case 'PROGRAM_MAP':
        return { label: 'Program Map', color: 'bg-blue-100 text-blue-700' };
      case 'PROGRAM_ASSESSMENT_STRATEGY':
        return { label: 'Assessment Strategy', color: 'bg-green-100 text-green-700' };
      case 'PROGRAM_EVALUATION':
        return { label: 'Program Evaluation', color: 'bg-orange-100 text-orange-700' };
      default:
        return null;
    }
  };

  const badge = getPageTypeBadge();

  // Render the appropriate view component based on page type
  const renderPageContent = () => {
    const type = pageMetadata?.type;

    // For now, all page types use BlockEditor
    // Specialized views can be added later as components are developed
    switch (type) {
      case 'PROGRAM_NEEDS_ANALYSIS':
        // TODO: Create ProgramNeedsAnalysisView component
        return <BlockEditor pageId={pageId} />;
      case 'PROGRAM_MAP':
        // TODO: Create ProgramMapView component
        return <BlockEditor pageId={pageId} />;
      case 'PROGRAM_ASSESSMENT_STRATEGY':
        // TODO: Create ProgramAssessmentStrategyView component
        return <BlockEditor pageId={pageId} />;
      case 'PROGRAM_EVALUATION':
        // TODO: Create ProgramEvaluationView component
        return <BlockEditor pageId={pageId} />;
      default:
        return <BlockEditor pageId={pageId} />;
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      {/* Breadcrumb navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/workspace" className="hover:text-[#03428e]">
            Workspace
          </Link>
          <span>/</span>
          <Link
            href="/workspace/curriculum"
            className="hover:text-[#03428e]"
          >
            Curriculum
          </Link>
          <span>/</span>
          <Link
            href={`/workspace/${workspaceId}/curriculum/${curriculumId}`}
            className="hover:text-[#03428e]"
          >
            {pageMetadata?.curriculumId ? 'Program' : 'Curriculum'}
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
