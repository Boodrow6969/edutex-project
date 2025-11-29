'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useWorkspacesTree, Workspace } from '@/lib/hooks/useWorkspacesTree';

/**
 * Sidebar component that displays the workspace/project tree.
 * Fetches data from the API and provides quick-create functionality.
 */
export default function Sidebar() {
  const {
    workspaces,
    isLoading,
    error,
    createWorkspace,
    createProject,
  } = useWorkspacesTree();

  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set()
  );

  // Quick create state
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  const [showCreateProject, setShowCreateProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  const toggleWorkspace = (workspaceId: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId);
    } else {
      newExpanded.add(workspaceId);
    }
    setExpandedWorkspaces(newExpanded);
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
      // Auto-expand the new workspace
      setExpandedWorkspaces((prev) => new Set([...prev, workspace.id]));
    }
  };

  const handleCreateProject = async (e: React.FormEvent, workspaceId: string) => {
    e.preventDefault();
    if (!newProjectName.trim() || creatingProject) return;

    setCreatingProject(true);
    const project = await createProject(workspaceId, newProjectName.trim());
    setCreatingProject(false);

    if (project) {
      setNewProjectName('');
      setShowCreateProject(null);
    }
  };

  const renderWorkspaceTree = (workspace: Workspace) => {
    const isExpanded = expandedWorkspaces.has(workspace.id);
    const isCreatingProjectHere = showCreateProject === workspace.id;

    return (
      <div key={workspace.id} className="space-y-1">
        <button
          onClick={() => toggleWorkspace(workspace.id)}
          className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded group"
        >
          <span className="truncate">{workspace.name}</span>
          <svg
            className={`w-4 h-4 transition-transform flex-shrink-0 ${
              isExpanded ? 'rotate-90' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {isExpanded && (
          <div className="ml-4 space-y-1">
            {workspace.projects.length === 0 && !isCreatingProjectHere && (
              <p className="p-2 text-xs text-gray-400">No projects yet</p>
            )}

            {workspace.projects.map((project) => (
              <Link
                key={project.id}
                href={`/workspace/${workspace.id}/project/${project.id}`}
                className="block p-2 text-sm text-gray-600 hover:bg-gray-100 rounded truncate"
              >
                {project.name}
              </Link>
            ))}

            {isCreatingProjectHere ? (
              <form
                onSubmit={(e) => handleCreateProject(e, workspace.id)}
                className="p-1"
              >
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                  disabled={creatingProject}
                />
                <div className="flex gap-1 mt-1">
                  <button
                    type="submit"
                    disabled={!newProjectName.trim() || creatingProject}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creatingProject ? '...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateProject(null);
                      setNewProjectName('');
                    }}
                    className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => {
                  setShowCreateProject(workspace.id);
                  setNewProjectName('');
                }}
                className="w-full text-left p-2 text-sm text-blue-600 hover:bg-gray-100 rounded"
              >
                + New Project
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-screen">
      {/* Logo/Brand */}
      <div className="p-4 border-b border-gray-200">
        <Link href="/workspace" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
            E
          </div>
          <span className="text-lg font-semibold text-gray-900">EduTex</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Error display */}
        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Create workspace form */}
            {showCreateWorkspace ? (
              <form onSubmit={handleCreateWorkspace} className="p-2 bg-white border border-gray-200 rounded">
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Workspace name..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                  disabled={creatingWorkspace}
                />
                <div className="flex gap-1 mt-2">
                  <button
                    type="submit"
                    disabled={!newWorkspaceName.trim() || creatingWorkspace}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creatingWorkspace ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateWorkspace(false);
                      setNewWorkspaceName('');
                    }}
                    className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowCreateWorkspace(true)}
                className="w-full p-2 text-sm text-blue-600 hover:bg-gray-100 rounded text-left flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Workspace
              </button>
            )}

            {/* Workspaces list */}
            {workspaces.length === 0 && !showCreateWorkspace ? (
              <div className="text-sm text-gray-500 p-4 text-center">
                No workspaces yet.
                <br />
                <button
                  onClick={() => setShowCreateWorkspace(true)}
                  className="mt-2 text-blue-600 hover:text-blue-700"
                >
                  Create your first workspace
                </button>
              </div>
            ) : (
              workspaces.map(renderWorkspaceTree)
            )}
          </div>
        )}
      </nav>

      {/* User menu at bottom */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">User</p>
            <Link href="/auth/signin" className="text-xs text-gray-500 hover:text-blue-600 truncate block">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
