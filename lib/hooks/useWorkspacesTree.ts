'use client';

import { useState, useEffect, useCallback } from 'react';
import { WorkspaceRole } from '@prisma/client';

/**
 * Course data structure from the API
 */
export interface Course {
  id: string;
  name: string;
  description: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Curriculum data structure from the API
 */
export interface Curriculum {
  id: string;
  name: string;
  description: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Workspace data structure from the API
 */
export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  role: WorkspaceRole | null;
  courses: Course[];
  curricula?: Curriculum[];
}

export type ArchiveItemType = 'workspace' | 'course' | 'curriculum';

/**
 * Hook return type
 */
export interface UseWorkspacesTreeReturn {
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  refetch: () => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace | null>;
  createCourse: (workspaceId: string, name: string, description?: string) => Promise<Course | null>;
  createCurriculum: (workspaceId: string, name: string, description?: string) => Promise<Curriculum | null>;
  archiveItem: (type: ArchiveItemType, id: string, action: 'archive' | 'restore') => Promise<boolean>;
  deleteItem: (type: ArchiveItemType, id: string) => Promise<boolean>;
}

function getArchiveUrl(type: ArchiveItemType, id: string): string {
  switch (type) {
    case 'workspace': return `/api/workspaces/${id}/archive`;
    case 'course': return `/api/courses/${id}/archive`;
    case 'curriculum': return `/api/curricula/${id}/archive`;
  }
}

function getDeleteUrl(type: ArchiveItemType, id: string): string {
  switch (type) {
    case 'workspace': return `/api/workspaces/${id}`;
    case 'course': return `/api/courses/${id}`;
    case 'curriculum': return `/api/curricula/${id}`;
  }
}

/**
 * Custom hook for fetching and managing the workspaces tree.
 * Provides functions for creating workspaces and courses.
 */
export function useWorkspacesTree(): UseWorkspacesTreeReturn {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    try {
      setError(null);
      const url = showArchived ? '/api/workspaces?includeArchived=true' : '/api/workspaces';
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated - this is expected before login
          setWorkspaces([]);
          return;
        }
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch workspaces');
      }

      const data = await response.json();
      setWorkspaces(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch workspaces';
      setError(message);
      console.error('Error fetching workspaces:', err);
    } finally {
      setIsLoading(false);
    }
  }, [showArchived]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const createWorkspace = useCallback(
    async (name: string, description?: string): Promise<Workspace | null> => {
      try {
        setError(null);
        const response = await fetch('/api/workspaces', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, description }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create workspace');
        }

        const newWorkspace = await response.json();

        // Add the new workspace to the list
        setWorkspaces((prev) => [...prev, newWorkspace].sort((a, b) => a.name.localeCompare(b.name)));

        return newWorkspace;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create workspace';
        setError(message);
        console.error('Error creating workspace:', err);
        return null;
      }
    },
    []
  );

  const createCourse = useCallback(
    async (workspaceId: string, name: string, description?: string): Promise<Course | null> => {
      try {
        setError(null);
        const response = await fetch('/api/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ workspaceId, name, description }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create course');
        }

        const newCourse = await response.json();

        // Add the new course to the appropriate workspace
        setWorkspaces((prev) =>
          prev.map((workspace) => {
            if (workspace.id === workspaceId) {
              return {
                ...workspace,
                courses: [...workspace.courses, newCourse].sort((a, b) =>
                  a.name.localeCompare(b.name)
                ),
              };
            }
            return workspace;
          })
        );

        return newCourse;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create course';
        setError(message);
        console.error('Error creating course:', err);
        return null;
      }
    },
    []
  );

  const createCurriculum = useCallback(
    async (workspaceId: string, name: string, description?: string): Promise<Curriculum | null> => {
      try {
        setError(null);
        const response = await fetch(`/api/workspaces/${workspaceId}/curricula`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, description }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create curriculum');
        }

        const newCurriculum = await response.json();

        // Add the new curriculum to the appropriate workspace
        setWorkspaces((prev) =>
          prev.map((workspace) => {
            if (workspace.id === workspaceId) {
              return {
                ...workspace,
                curricula: [...(workspace.curricula || []), newCurriculum].sort((a, b) =>
                  a.name.localeCompare(b.name)
                ),
              };
            }
            return workspace;
          })
        );

        return newCurriculum;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create curriculum';
        setError(message);
        console.error('Error creating curriculum:', err);
        return null;
      }
    },
    []
  );

  const archiveItem = useCallback(
    async (type: ArchiveItemType, id: string, action: 'archive' | 'restore'): Promise<boolean> => {
      try {
        const response = await fetch(getArchiveUrl(type, id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Failed to ${action} item`);
        }

        // Refetch to get updated data
        await fetchWorkspaces();
        return true;
      } catch (err) {
        console.error(`Error ${action}ing item:`, err);
        return false;
      }
    },
    [fetchWorkspaces]
  );

  const deleteItem = useCallback(
    async (type: ArchiveItemType, id: string): Promise<boolean> => {
      try {
        const response = await fetch(getDeleteUrl(type, id), {
          method: 'DELETE',
        });

        if (!response.ok && response.status !== 204) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete item');
        }

        // Refetch to get updated data
        await fetchWorkspaces();
        return true;
      } catch (err) {
        console.error('Error deleting item:', err);
        return false;
      }
    },
    [fetchWorkspaces]
  );

  return {
    workspaces,
    isLoading,
    error,
    showArchived,
    setShowArchived,
    refetch: fetchWorkspaces,
    createWorkspace,
    createCourse,
    createCurriculum,
    archiveItem,
    deleteItem,
  };
}
