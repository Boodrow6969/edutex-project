'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePageByType } from '@/lib/hooks/usePageByType';
import LearningObjectivesView from '@/components/pages/LearningObjectivesView';

export default function ObjectivesPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const workspaceId = params.workspaceId as string;
  const { pageId, isLoading, error, notFound } = usePageByType(courseId, 'LEARNING_OBJECTIVES');

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

  if (notFound || !pageId) {
    return (
      <div className="min-h-full">
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/workspace" className="hover:text-blue-600">Workspaces</Link>
            <span>/</span>
            <Link href={`/workspace/${workspaceId}/course/${courseId}`} className="hover:text-blue-600">Course</Link>
            <span>/</span>
            <span className="text-gray-900">Learning Objectives</span>
          </nav>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-600">Learning Objectives page hasn&apos;t been created yet.</p>
          <Link href={`/workspace/${workspaceId}/course/${courseId}`} className="inline-block mt-4 text-blue-600 hover:text-blue-700">
            ← Back to Course Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/workspace" className="hover:text-blue-600">Workspaces</Link>
          <span>/</span>
          <Link href={`/workspace/${workspaceId}/course/${courseId}`} className="hover:text-blue-600">Course</Link>
          <span>/</span>
          <span className="text-gray-900">Learning Objectives</span>
        </nav>
      </div>
      <div className="flex-1 overflow-hidden">
        <LearningObjectivesView pageId={pageId} courseId={courseId} />
      </div>
    </div>
  );
}
