'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useWorkspacesTree, Workspace } from '@/lib/hooks/useWorkspacesTree';

// Navigation items
const mainNavItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/workspace', icon: 'grid' },
];

const bottomNavItems = [
  { id: 'content', label: 'Content Assets', href: '/content', icon: 'folder' },
  { id: 'feedback', label: 'Feedback & QA', href: '/feedback', icon: 'message' },
];

// Icon components
function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function ChevronIcon({ className, expanded }: { className?: string; expanded?: boolean }) {
  return (
    <svg
      className={`${className} transition-transform ${expanded ? 'rotate-90' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  grid: GridIcon,
  folder: FolderIcon,
  message: MessageIcon,
  settings: SettingsIcon,
  layers: LayersIcon,
  book: BookIcon,
};

/**
 * Sidebar component with dark navy theme.
 */
export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const {
    workspaces,
    isLoading,
    error,
    createWorkspace,
    createCourse,
    createCurriculum,
  } = useWorkspacesTree();

  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(null);
  const [showWorkspacesSection, setShowWorkspacesSection] = useState(true);

  // Quick create state
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  const [showCreateCourse, setShowCreateCourse] = useState<string | null>(null);
  const [newCourseName, setNewCourseName] = useState('');
  const [creatingCourse, setCreatingCourse] = useState(false);

  const [showCreateCurriculum, setShowCreateCurriculum] = useState<string | null>(null);
  const [newCurriculumName, setNewCurriculumName] = useState('');
  const [creatingCurriculum, setCreatingCurriculum] = useState(false);

  const handleWorkspaceClick = (workspaceId: string) => {
    router.push(`/workspace/${workspaceId}`);
    setExpandedWorkspaceId(workspaceId);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim() || creatingWorkspace) return;

    setCreatingWorkspace(true);
    const workspace = await createWorkspace(newWorkspaceName.trim());
    setCreatingWorkspace(false);

    if (workspace) {
      setNewWorkspaceName('');
      setShowCreateWorkspace(false);
      setExpandedWorkspaceId(workspace.id);
      router.push(`/workspace/${workspace.id}`);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent, workspaceId: string) => {
    e.preventDefault();
    if (!newCourseName.trim() || creatingCourse) return;

    setCreatingCourse(true);
    const course = await createCourse(workspaceId, newCourseName.trim());
    setCreatingCourse(false);

    if (course) {
      setNewCourseName('');
      setShowCreateCourse(null);
    }
  };

  const handleCreateCurriculum = async (e: React.FormEvent, workspaceId: string) => {
    e.preventDefault();
    if (!newCurriculumName.trim() || creatingCurriculum) return;

    setCreatingCurriculum(true);
    const curriculum = await createCurriculum(workspaceId, newCurriculumName.trim());
    setCreatingCurriculum(false);

    if (curriculum) {
      setNewCurriculumName('');
      setShowCreateCurriculum(null);
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === '/workspace') {
      return pathname === '/workspace';
    }
    return pathname?.startsWith(href);
  };

  const renderNavItem = (item: { id: string; label: string; href: string; icon: string }) => {
    const Icon = iconMap[item.icon];
    const isActive = isActiveRoute(item.href);

    return (
      <Link
        key={item.id}
        href={item.href}
        className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors ${
          isActive
            ? 'bg-[#03428e] text-white'
            : 'text-gray-300 hover:text-white hover:bg-white/10'
        }`}
      >
        {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
        <span>{item.label}</span>
      </Link>
    );
  };

  const renderWorkspaceTree = (workspace: Workspace) => {
    const isExpanded = expandedWorkspaceId === workspace.id;
    const isActiveWorkspace = pathname?.startsWith(`/workspace/${workspace.id}`);
    const isCreatingCourseHere = showCreateCourse === workspace.id;
    const isCreatingCurriculumHere = showCreateCurriculum === workspace.id;

    return (
      <div key={workspace.id} className="space-y-0.5">
        <button
          onClick={() => handleWorkspaceClick(workspace.id)}
          className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${
            isActiveWorkspace
              ? 'bg-[#03428e] text-white'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <span className="truncate">{workspace.name}</span>
          <ChevronIcon className="w-4 h-4 flex-shrink-0" expanded={isExpanded} />
        </button>

        {isExpanded && (
          <div className="ml-4 space-y-0.5">
            {/* Submenu actions */}
            {isCreatingCourseHere ? (
              <form onSubmit={(e) => handleCreateCourse(e, workspace.id)} className="px-4 py-2">
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Course name..."
                  className="w-full px-2 py-1.5 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#03428e]"
                  autoFocus
                  disabled={creatingCourse}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={!newCourseName.trim() || creatingCourse}
                    className="px-3 py-1 text-xs bg-[#03428e] text-white rounded hover:bg-[#022d61] disabled:opacity-50"
                  >
                    {creatingCourse ? '...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateCourse(null);
                      setNewCourseName('');
                    }}
                    className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => {
                  setShowCreateCourse(workspace.id);
                  setShowCreateCurriculum(null);
                  setNewCourseName('');
                }}
                className="w-full text-left px-4 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                + New Course
              </button>
            )}

            {isCreatingCurriculumHere ? (
              <form onSubmit={(e) => handleCreateCurriculum(e, workspace.id)} className="px-4 py-2">
                <input
                  type="text"
                  value={newCurriculumName}
                  onChange={(e) => setNewCurriculumName(e.target.value)}
                  placeholder="Curriculum name..."
                  className="w-full px-2 py-1.5 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#03428e]"
                  autoFocus
                  disabled={creatingCurriculum}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={!newCurriculumName.trim() || creatingCurriculum}
                    className="px-3 py-1 text-xs bg-[#03428e] text-white rounded hover:bg-[#022d61] disabled:opacity-50"
                  >
                    {creatingCurriculum ? '...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateCurriculum(null);
                      setNewCurriculumName('');
                    }}
                    className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => {
                  setShowCreateCurriculum(workspace.id);
                  setShowCreateCourse(null);
                  setNewCurriculumName('');
                }}
                className="w-full text-left px-4 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                + New Curriculum
              </button>
            )}

            <Link
              href={`/workspace/${workspace.id}/learners`}
              className="block px-4 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Add Learners
            </Link>

            <Link
              href={`/workspace/${workspace.id}/analytics`}
              className="block px-4 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Analytics & Reports
            </Link>

            {/* Divider */}
            {(workspace.courses.length > 0 || (workspace.curricula && workspace.curricula.length > 0)) && (
              <div className="my-2 border-t border-white/10" />
            )}

            {/* Courses */}
            {workspace.courses.map((course) => (
              <Link
                key={course.id}
                href={`/workspace/${workspace.id}/course/${course.id}`}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm rounded-lg truncate transition-colors ${
                  pathname?.includes(course.id)
                    ? 'bg-[#03428e] text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{course.name}</span>
              </Link>
            ))}

            {/* Curricula */}
            {workspace.curricula?.map((curriculum) => (
              <Link
                key={curriculum.id}
                href={`/workspace/${workspace.id}/curriculum/${curriculum.id}`}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm rounded-lg truncate transition-colors ${
                  pathname?.includes(curriculum.id)
                    ? 'bg-[#03428e] text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayersIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{curriculum.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-[220px] bg-[#1E293B] flex flex-col h-screen">
      {/* Logo/Brand */}
      <div className="p-4 border-b border-white/10">
        <Link href="/workspace" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#03428e] rounded flex items-center justify-center text-white font-bold text-sm">
            E
          </div>
          <div>
            <span className="text-white font-semibold block">EduTex</span>
            <span className="text-xs text-gray-400">AI-Powered Design</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Main Section */}
        <div className="px-4 mb-2">
          <span className="text-xs uppercase text-gray-500 tracking-wider font-medium">
            Main
          </span>
        </div>
        <div className="space-y-0.5 px-2">
          {mainNavItems.map(renderNavItem)}
        </div>

        {/* Workspaces Section */}
        <div className="mt-6">
          <button
            onClick={() => setShowWorkspacesSection(!showWorkspacesSection)}
            className="w-full px-4 mb-2 flex items-center justify-between"
          >
            <span className="text-xs uppercase text-gray-500 tracking-wider font-medium">
              Workspaces
            </span>
            <ChevronIcon className="w-3 h-3 text-gray-500" expanded={showWorkspacesSection} />
          </button>

          {showWorkspacesSection && (
            <div className="px-2 space-y-0.5">
              {error && (
                <div className="mx-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-[#03428e] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {workspaces.map(renderWorkspaceTree)}

                  {workspaces.length === 0 && !showCreateWorkspace && (
                    <div className="px-4 py-2 text-xs text-gray-500">
                      No workspaces yet
                    </div>
                  )}

                  {/* New Workspace button at bottom */}
                  {showCreateWorkspace ? (
                    <form onSubmit={handleCreateWorkspace} className="px-2 py-2">
                      <input
                        type="text"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        placeholder="Workspace name..."
                        className="w-full px-2 py-1.5 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#03428e]"
                        autoFocus
                        disabled={creatingWorkspace}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          disabled={!newWorkspaceName.trim() || creatingWorkspace}
                          className="px-3 py-1 text-xs bg-[#03428e] text-white rounded hover:bg-[#022d61] disabled:opacity-50"
                        >
                          {creatingWorkspace ? '...' : 'Create'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateWorkspace(false);
                            setNewWorkspaceName('');
                          }}
                          className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowCreateWorkspace(true)}
                      className="w-full text-left px-4 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      + New Workspace
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom nav items */}
        <div className="mt-6">
          <div className="px-4 mb-2">
            <span className="text-xs uppercase text-gray-500 tracking-wider font-medium">
              Tools
            </span>
          </div>
          <div className="space-y-0.5 px-2">
            {bottomNavItems.map(renderNavItem)}
          </div>
        </div>
      </nav>

      {/* Settings at bottom */}
      <div className="p-2 border-t border-white/10">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors ${
            pathname === '/settings'
              ? 'bg-[#03428e] text-white'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <SettingsIcon className="w-5 h-5 flex-shrink-0" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
