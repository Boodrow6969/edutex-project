'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useWorkspacesTree, Workspace, ArchiveItemType } from '@/lib/hooks/useWorkspacesTree';
import { useToast } from '@/components/Toast';
import DeleteWorkspaceModal from '@/components/modals/DeleteWorkspaceModal';
import DeleteCourseModal from '@/components/modals/DeleteCourseModal';
import DeleteCurriculumModal from '@/components/modals/DeleteCurriculumModal';

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

function EllipsisIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  );
}

function ArchiveBoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function RestoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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

interface ContextMenuState {
  type: ArchiveItemType;
  id: string;
  name: string;
  isArchived: boolean;
  workspaceId?: string;
}

export interface DeleteTarget {
  type: ArchiveItemType;
  id: string;
  name: string;
}

/**
 * Sidebar component with dark navy theme.
 */
export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const {
    workspaces,
    isLoading,
    error,
    showArchived,
    setShowArchived,
    createWorkspace,
    createCourse,
    createCurriculum,
    archiveItem,
    refetch,
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

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Delete target state (for modals)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Close context menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }
    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu]);

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

  const handleArchive = async (type: ArchiveItemType, id: string, name: string) => {
    setContextMenu(null);
    const success = await archiveItem(type, id, 'archive');
    if (success) {
      showToast(`"${name}" archived`, {
        label: 'Undo',
        onClick: () => {
          archiveItem(type, id, 'restore');
        },
      });
    }
  };

  const handleRestore = async (type: ArchiveItemType, id: string, name: string) => {
    setContextMenu(null);
    const success = await archiveItem(type, id, 'restore');
    if (success) {
      showToast(`"${name}" restored`);
    }
  };

  const handleDeleteClick = (type: ArchiveItemType, id: string, name: string) => {
    setContextMenu(null);
    setDeleteTarget({ type, id, name });
  };

  const handleDeleted = () => {
    setDeleteTarget(null);
    refetch();
    // If the deleted item was the current page, navigate away
    if (deleteTarget) {
      const isCurrentItem =
        (deleteTarget.type === 'workspace' && pathname?.includes(deleteTarget.id)) ||
        (deleteTarget.type === 'course' && pathname?.includes(deleteTarget.id)) ||
        (deleteTarget.type === 'curriculum' && pathname?.includes(deleteTarget.id));
      if (isCurrentItem) {
        router.push('/workspace');
      }
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === '/workspace') {
      return pathname === '/workspace';
    }
    return pathname?.startsWith(href);
  };

  const openContextMenu = (e: React.MouseEvent, item: ContextMenuState) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(item);
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

  const renderContextMenu = () => {
    if (!contextMenu) return null;

    return (
      <div
        ref={contextMenuRef}
        className="absolute right-0 top-full mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-1"
      >
        {contextMenu.isArchived ? (
          <button
            onClick={() => handleRestore(contextMenu.type, contextMenu.id, contextMenu.name)}
            className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2"
          >
            <RestoreIcon className="w-4 h-4" />
            Restore
          </button>
        ) : (
          <button
            onClick={() => handleArchive(contextMenu.type, contextMenu.id, contextMenu.name)}
            className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2"
          >
            <ArchiveBoxIcon className="w-4 h-4" />
            Archive
          </button>
        )}
        <button
          onClick={() => handleDeleteClick(contextMenu.type, contextMenu.id, contextMenu.name)}
          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
        >
          <TrashIcon className="w-4 h-4" />
          Delete
        </button>
      </div>
    );
  };

  const renderWorkspaceTree = (workspace: Workspace) => {
    const isExpanded = expandedWorkspaceId === workspace.id;
    const isActiveWorkspace = pathname?.startsWith(`/workspace/${workspace.id}`);
    const isCreatingCourseHere = showCreateCourse === workspace.id;
    const isCreatingCurriculumHere = showCreateCurriculum === workspace.id;
    const isArchived = !!workspace.archivedAt;

    return (
      <div key={workspace.id} className="space-y-0.5">
        <div className={`group relative flex items-center ${isArchived ? 'opacity-60' : ''}`}>
          <button
            onClick={() => handleWorkspaceClick(workspace.id)}
            className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors ${
              isActiveWorkspace
                ? 'bg-[#03428e] text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="truncate flex items-center gap-1.5">
              {workspace.name}
              {isArchived && (
                <span className="text-[10px] bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded">
                  Archived
                </span>
              )}
            </span>
            <ChevronIcon className="w-4 h-4 flex-shrink-0" expanded={isExpanded} />
          </button>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) =>
                openContextMenu(e, {
                  type: 'workspace',
                  id: workspace.id,
                  name: workspace.name,
                  isArchived,
                })
              }
              className="p-1 text-gray-400 hover:text-white rounded"
            >
              <EllipsisIcon className="w-4 h-4" />
            </button>
            {contextMenu?.type === 'workspace' && contextMenu.id === workspace.id && renderContextMenu()}
          </div>
        </div>

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
            {workspace.courses.map((course) => {
              const isCourseArchived = !!course.archivedAt;
              return (
                <div key={course.id} className={`group/item relative ${isCourseArchived ? 'opacity-60' : ''}`}>
                  <Link
                    href={`/workspace/${workspace.id}/course/${course.id}`}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm rounded-lg truncate transition-colors ${
                      pathname?.includes(course.id)
                        ? 'bg-[#03428e] text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <BookIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{course.name}</span>
                    {isCourseArchived && (
                      <span className="text-[10px] bg-gray-600 text-gray-300 px-1 py-0.5 rounded flex-shrink-0">
                        Archived
                      </span>
                    )}
                  </Link>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button
                      onClick={(e) =>
                        openContextMenu(e, {
                          type: 'course',
                          id: course.id,
                          name: course.name,
                          isArchived: isCourseArchived,
                          workspaceId: workspace.id,
                        })
                      }
                      className="p-1 text-gray-400 hover:text-white rounded"
                    >
                      <EllipsisIcon className="w-3.5 h-3.5" />
                    </button>
                    {contextMenu?.type === 'course' && contextMenu.id === course.id && renderContextMenu()}
                  </div>
                </div>
              );
            })}

            {/* Curricula */}
            {workspace.curricula?.map((curriculum) => {
              const isCurriculumArchived = !!curriculum.archivedAt;
              return (
                <div key={curriculum.id} className={`group/item relative ${isCurriculumArchived ? 'opacity-60' : ''}`}>
                  <Link
                    href={`/workspace/${workspace.id}/curriculum/${curriculum.id}`}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm rounded-lg truncate transition-colors ${
                      pathname?.includes(curriculum.id)
                        ? 'bg-[#03428e] text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <LayersIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{curriculum.name}</span>
                    {isCurriculumArchived && (
                      <span className="text-[10px] bg-gray-600 text-gray-300 px-1 py-0.5 rounded flex-shrink-0">
                        Archived
                      </span>
                    )}
                  </Link>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button
                      onClick={(e) =>
                        openContextMenu(e, {
                          type: 'curriculum',
                          id: curriculum.id,
                          name: curriculum.name,
                          isArchived: isCurriculumArchived,
                          workspaceId: workspace.id,
                        })
                      }
                      className="p-1 text-gray-400 hover:text-white rounded"
                    >
                      <EllipsisIcon className="w-3.5 h-3.5" />
                    </button>
                    {contextMenu?.type === 'curriculum' && contextMenu.id === curriculum.id && renderContextMenu()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
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

                    {/* Show/Hide Archived toggle */}
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className="w-full text-left px-4 py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showArchived ? 'Hide archived' : 'Show archived'}
                    </button>
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

      {/* Delete Modals */}
      {deleteTarget?.type === 'workspace' && (
        <DeleteWorkspaceModal
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          workspaceId={deleteTarget.id}
          workspaceName={deleteTarget.name}
          onDeleted={handleDeleted}
        />
      )}
      {deleteTarget?.type === 'course' && (
        <DeleteCourseModal
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          courseId={deleteTarget.id}
          courseName={deleteTarget.name}
          onDeleted={handleDeleted}
        />
      )}
      {deleteTarget?.type === 'curriculum' && (
        <DeleteCurriculumModal
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          curriculumId={deleteTarget.id}
          curriculumName={deleteTarget.name}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}

