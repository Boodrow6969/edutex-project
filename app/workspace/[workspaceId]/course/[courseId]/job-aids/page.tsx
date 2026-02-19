'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function JobAidsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const courseId = params.courseId as string;

  return (
    <div className="min-h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/workspace" className="hover:text-blue-600">Workspaces</Link>
          <span>/</span>
          <Link href={`/workspace/${workspaceId}`} className="hover:text-blue-600">Workspace</Link>
          <span>/</span>
          <Link href={`/workspace/${workspaceId}/course/${courseId}`} className="hover:text-blue-600">Course</Link>
          <span>/</span>
          <span className="text-gray-900">Job Aids</span>
        </nav>
      </div>
      <div className="p-6 max-w-6xl mx-auto">
        <Link
          href={`/workspace/${workspaceId}/course/${courseId}`}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Back to Course Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Job Aids</h1>
        <p className="text-sm text-gray-500 mt-2">This page will be wired in Prompt 2.</p>
      </div>
    </div>
  );
}
