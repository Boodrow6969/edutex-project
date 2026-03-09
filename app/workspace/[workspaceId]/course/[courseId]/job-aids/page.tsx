'use client';

import { useParams } from 'next/navigation';
import JobAidsView from '@/components/pages/JobAidsView';

export default function JobAidsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const courseId = params.courseId as string;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <JobAidsView workspaceId={workspaceId} courseId={courseId} />
    </div>
  );
}
