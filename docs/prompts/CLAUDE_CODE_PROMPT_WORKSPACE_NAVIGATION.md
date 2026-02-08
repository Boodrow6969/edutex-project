# Claude Code Prompt: Fix Workspace Navigation

> **Migration Note (2026-02-08):** The `Project` model was renamed to `Course`. Route path `/workspace/{wsId}/project/{id}` is now `/workspace/{wsId}/course/{id}`.

## Problem
Clicking a workspace name in the sidebar only expands/collapses the submenu. It should navigate to `/workspace/{workspaceId}` and show a Workspace detail page.

## Tasks

### Task 1: Create Workspace Detail Page
Create file: `app/workspace/[workspaceId]/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Course {
  id: string;
  name: string;
  description: string | null;
  status: string;
  phase: string;
  updatedAt: string;
  _count?: {
    pages: number;
    objectives: number;
    tasks: number;
  };
}

interface Curriculum {
  id: string;
  name: string;
  description: string | null;
  status: string;
  programDuration: string | null;
  totalHours: number | null;
  _count?: {
    courses: number;
    pages: number;
  };
}

interface WorkspaceDetail {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  courses: Course[];
  curricula: Curriculum[];
  _count: {
    courses: number;
    curricula: number;
    members: number;
  };
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-600',
    review: 'bg-yellow-100 text-yellow-600',
    published: 'bg-green-100 text-green-600',
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${colors[status] || colors.draft}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

// Icons
function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function WorkspaceDetailPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [workspace, setWorkspace] = useState<WorkspaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkspace() {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch workspace');
        }
        const data = await res.json();
        setWorkspace(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (workspaceId) {
      fetchWorkspace();
    }
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#03428e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Workspace not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/workspace" className="hover:text-[#03428e]">
          Workspaces
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{workspace.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-gray-600 mb-2">{workspace.description}</p>
          )}
          <p className="text-sm text-gray-500">
            Created {new Date(workspace.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{workspace._count.courses}</div>
            <div className="text-sm text-gray-500">Courses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{workspace._count.curricula}</div>
            <div className="text-sm text-gray-500">Curricula</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{workspace._count.members}</div>
            <div className="text-sm text-gray-500">Members</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        <Link
          href={`/workspace/${workspaceId}/new-course`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#03428e] text-white rounded-lg hover:bg-[#022d61] transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          New Course
        </Link>
        <Link
          href={`/workspace/${workspaceId}/new-curriculum`}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#03428e] text-[#03428e] rounded-lg hover:bg-blue-50 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          New Curriculum
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Courses & Curricula */}
        <div className="lg:col-span-2 space-y-6">
          {/* Courses Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Courses</h2>
                <p className="text-sm text-gray-500">{workspace.courses.length} courses</p>
              </div>
              <Link
                href={`/workspace/${workspaceId}/new-course`}
                className="inline-flex items-center gap-1 text-sm text-[#03428e] hover:underline"
              >
                <PlusIcon className="w-4 h-4" />
                New Course
              </Link>
            </div>

            {workspace.courses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No courses yet</p>
                <p className="text-sm">Create your first course to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {workspace.courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/workspace/${workspaceId}/project/${course.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-[#03428e] hover:bg-blue-50/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <BookIcon className="w-5 h-5 text-gray-400 group-hover:text-[#03428e]" />
                      <div>
                        <div className="font-medium text-gray-900">{course.name}</div>
                        {course.description && (
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {course.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={course.status} />
                      <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-[#03428e]" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Curricula Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Curricula</h2>
                <p className="text-sm text-gray-500">{workspace.curricula.length} curricula</p>
              </div>
              <Link
                href={`/workspace/${workspaceId}/new-curriculum`}
                className="inline-flex items-center gap-1 text-sm text-[#03428e] hover:underline"
              >
                <PlusIcon className="w-4 h-4" />
                New Curriculum
              </Link>
            </div>

            {workspace.curricula.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <LayersIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No curricula yet</p>
                <p className="text-sm">Create a curriculum to group courses into learning paths</p>
              </div>
            ) : (
              <div className="space-y-2">
                {workspace.curricula.map((curriculum) => (
                  <Link
                    key={curriculum.id}
                    href={`/workspace/${workspaceId}/curriculum/${curriculum.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-[#03428e] hover:bg-blue-50/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <LayersIcon className="w-5 h-5 text-gray-400 group-hover:text-[#03428e]" />
                      <div>
                        <div className="font-medium text-gray-900">{curriculum.name}</div>
                        <div className="text-sm text-gray-500">
                          {curriculum._count?.courses || 0} courses
                          {curriculum.programDuration && ` • ${curriculum.programDuration}`}
                          {curriculum.totalHours && ` • ${curriculum.totalHours}h`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={curriculum.status} />
                      <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-[#03428e]" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Members Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Team Members</h3>
              <Link
                href={`/workspace/${workspaceId}/learners`}
                className="text-[#03428e] hover:underline text-sm"
              >
                Manage
              </Link>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <UsersIcon className="w-5 h-5" />
              <span>{workspace._count.members} member{workspace._count.members !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href={`/workspace/${workspaceId}/learners`}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-gray-700"
              >
                <UsersIcon className="w-4 h-4" />
                <span>Add Learners</span>
              </Link>
              <Link
                href={`/workspace/${workspaceId}/analytics`}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analytics & Reports</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Task 2: Create API Route
Create file: `app/api/workspaces/[workspaceId]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            phase: true,
            updatedAt: true,
            _count: {
              select: {
                pages: true,
                objectives: true,
                tasks: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        curricula: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            programDuration: true,
            totalHours: true,
            _count: {
              select: {
                courses: true,
                pages: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        _count: {
          select: {
            projects: true,
            curricula: true,
            members: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Transform the response to use "courses" instead of "projects" for clarity
    const response = {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      createdAt: workspace.createdAt,
      courses: workspace.projects,
      curricula: workspace.curricula,
      _count: {
        courses: workspace._count.projects,
        curricula: workspace._count.curricula,
        members: workspace._count.members,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    );
  }
}
```

### Task 3: Update Sidebar
In `components/Sidebar.tsx`, update the `renderWorkspaceTree` function.

Find and replace the workspace header button to separate navigation from expand/collapse:

**FIND (around line 226-234):**
```tsx
return (
  <div key={workspace.id} className="space-y-0.5">
    <button
      onClick={() => toggleWorkspace(workspace.id)}
      className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
    >
      <span className="truncate">{workspace.name}</span>
      <ChevronIcon className="w-4 h-4 flex-shrink-0" expanded={isExpanded} />
    </button>
```

**REPLACE WITH:**
```tsx
const isActiveWorkspace = pathname === `/workspace/${workspace.id}`;

return (
  <div key={workspace.id} className="space-y-0.5">
    <div
      className={`flex items-center justify-between rounded-lg transition-colors ${
        isActiveWorkspace
          ? 'bg-[#03428e] text-white'
          : 'text-gray-300 hover:text-white hover:bg-white/10'
      }`}
    >
      {/* Workspace name - navigates to workspace detail page */}
      <Link
        href={`/workspace/${workspace.id}`}
        className="flex-1 px-4 py-2 text-sm truncate"
      >
        {workspace.name}
      </Link>
      
      {/* Chevron - toggles expand/collapse */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWorkspace(workspace.id);
        }}
        className="px-2 py-2 hover:bg-white/10 rounded-r-lg"
      >
        <ChevronIcon className="w-4 h-4 flex-shrink-0" expanded={isExpanded} />
      </button>
    </div>
```

## Summary
After these changes:
1. Clicking a workspace NAME → navigates to `/workspace/{workspaceId}`
2. Clicking the CHEVRON → expands/collapses the submenu
3. The workspace detail page shows breadcrumb, stats, courses list, and curricula list
