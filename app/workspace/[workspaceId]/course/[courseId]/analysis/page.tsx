'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import NeedsAnalysisView from '@/components/pages/NeedsAnalysisView';

export default function AnalysisPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const workspaceId = params.workspaceId as string;

  // Support ?tab=stakeholders from dashboard Stakeholders card
  const initialTab = searchParams.get('tab') || undefined;

  const [pageId, setPageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      try {
        const res = await fetch(`/api/courses/${courseId}/overview`);
        if (!res.ok) throw new Error('Failed to load course');
        const data = await res.json();
        const naPage = data.pages?.find((p: any) => p.type === 'NEEDS_ANALYSIS');
        setPageId(naPage?.id || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPage();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <Link href={`/workspace/${workspaceId}/course/${courseId}`} className="inline-block mt-4 text-blue-600 hover:text-blue-700">
            ← Back to Course Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/workspace" className="hover:text-blue-600">Workspaces</Link>
          <span>/</span>
          <Link href={`/workspace/${workspaceId}/course/${courseId}`} className="hover:text-blue-600">Course</Link>
          <span>/</span>
          <span className="text-gray-900">Needs Analysis</span>
        </nav>
      </div>

      {/* View */}
      <div className="flex-1 overflow-hidden">
        <NeedsAnalysisView
          courseId={courseId}
          workspaceId={workspaceId}
          pageId={pageId || undefined}
          initialTab={initialTab}
        />
      </div>
    </div>
  );
}
