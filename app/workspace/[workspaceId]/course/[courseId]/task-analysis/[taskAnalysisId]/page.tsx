'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TaskAnalysisDetailView from '@/components/pages/task-analysis/TaskAnalysisDetailView';

export default function TaskAnalysisDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const workspaceId = params.workspaceId as string;
  const taskAnalysisId = params.taskAnalysisId as string;

  return (
    <div className="min-h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/workspace" className="hover:text-blue-600">Workspaces</Link>
          <span>/</span>
          <Link href={`/workspace/${workspaceId}/course/${courseId}`} className="hover:text-blue-600">Course</Link>
          <span>/</span>
          <Link href={`/workspace/${workspaceId}/course/${courseId}/task-analysis`} className="hover:text-blue-600">Task Analysis</Link>
          <span>/</span>
          <span className="text-gray-900">Detail</span>
        </nav>
      </div>
      <div className="flex-1 overflow-hidden">
        <TaskAnalysisDetailView
          courseId={courseId}
          workspaceId={workspaceId}
          taskAnalysisId={taskAnalysisId}
        />
      </div>
    </div>
  );
}
