'use client';

import { useParams } from 'next/navigation';
import CourseDashboard from '@/components/course/CourseDashboard';

/**
 * Course detail page — renders the new CourseDashboard.
 */
export default function CoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const workspaceId = params.workspaceId as string;

  return <CourseDashboard courseId={courseId} workspaceId={workspaceId} />;
}
