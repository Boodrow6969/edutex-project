'use client';

import { useState, useEffect, useCallback } from 'react';
import { WorkspaceRole } from '@prisma/client';

/**
 * Project data structure from the API
 */
export interface Project {
  id: string;
  name: string;
  description: string | null;
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
  createdAt: string;
  updatedAt: string;
  role: WorkspaceRole | null;
  projects: Project[];
  curricula?: Curriculum[];
}

/**
 * Hook return type
 */
export interface UseWorkspacesTreeReturn {
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace | null>;
  createProject: (workspaceId: string, name: string, description?: string) => Promise<Project | null>;
  createCurriculum: (workspaceId: string, name: string, description?: string) => Promise<Curriculum | null>;
}

/**
 * Custom hook for fetching and managing the workspaces tree.
 * Provides functions for creating workspaces and projects.
 */
export function useWorkspacesTree(): UseWorkspacesTreeReturn {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/workspaces');

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
  }, []);

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

  const createProject = useCallback(
    async (workspaceId: string, name: string, description?: string): Promise<Project | null> => {
      try {
        setError(null);
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ workspaceId, name, description }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create project');
        }

        const newProject = await response.json();

        // Add the new project to the appropriate workspace
        setWorkspaces((prev) =>
          prev.map((workspace) => {
            if (workspace.id === workspaceId) {
              return {
                ...workspace,
                projects: [...workspace.projects, newProject].sort((a, b) =>
                  a.name.localeCompare(b.name)
                ),
              };
            }
            return workspace;
          })
        );

        return newProject;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create project';
        setError(message);
        console.error('Error creating project:', err);
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

  return {
    workspaces,
    isLoading,
    error,
    refetch: fetchWorkspaces,
    createWorkspace,
    createProject,
    createCurriculum,
  };
}
