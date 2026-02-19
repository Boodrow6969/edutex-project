'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AssessmentPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const courseId = params.courseId as string;

  return (
    <div className="min-h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/workspace" className="hover:text-blue-600">Workspaces</Link>
          <span>/</span>
          <Link href={`/workspace/${workspaceId}/course/${courseId}`} className="hover:text-blue-600">Course</Link>
          <span>/</span>
          <span className="text-gray-900">Assessment Plan</span>
        </nav>
      </div>
      <div className="p-8 max-w-6xl mx-auto text-center">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900">Assessment Plan</h1>
          <p className="text-gray-500 mt-3">Assessment Plan module coming soon.</p>
          <Link
            href={`/workspace/${workspaceId}/course/${courseId}`}
            className="inline-block mt-6 text-blue-600 hover:text-blue-700"
          >
            ← Back to Course Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
