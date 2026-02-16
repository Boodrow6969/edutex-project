'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LearningTaskData } from '@/lib/types/taskAnalysis';

interface UseLearningTasksReturn {
  tasks: LearningTaskData[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  createTask: (title: string, taskAnalysisId?: string) => Promise<LearningTaskData | null>;
  updateTask: (taskId: string, updates: Partial<LearningTaskData>) => void;
  deleteTask: (taskId: string) => Promise<boolean>;
  moveTask: (taskId: string, direction: 'up' | 'down') => Promise<void>;
  refetch: () => Promise<void>;
}

const DEBOUNCE_DELAY = 500;

export function useLearningTasks(courseId: string): UseLearningTasksReturn {
  const [tasks, setTasks] = useState<LearningTaskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const baseUrl = `/api/courses/${courseId}/learning-tasks`;

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(baseUrl);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch tasks');
      }
      const data: LearningTaskData[] = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    if (courseId) {
      fetchTasks();
    }
  }, [courseId, fetchTasks]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Create a new task
  const createTask = useCallback(
    async (title: string, taskAnalysisId?: string): Promise<LearningTaskData | null> => {
      try {
        setIsSaving(true);
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, taskAnalysisId }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create task');
        }
        const created: LearningTaskData = await response.json();
        setTasks((prev) => [...prev, created]);
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create task');
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [baseUrl]
  );

  // Update a task — optimistic update + debounced PATCH
  const updateTask = useCallback(
    (taskId: string, updates: Partial<LearningTaskData>) => {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      );

      // Clear existing timer for this task
      const existing = debounceTimers.current.get(taskId);
      if (existing) clearTimeout(existing);

      // Debounced save
      const timer = setTimeout(async () => {
        try {
          setIsSaving(true);
          const response = await fetch(`${baseUrl}/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update task');
          }
          const updated: LearningTaskData = await response.json();
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? updated : t))
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to update task');
          // Revert on failure
          await fetchTasks();
        } finally {
          setIsSaving(false);
        }
        debounceTimers.current.delete(taskId);
      }, DEBOUNCE_DELAY);

      debounceTimers.current.set(taskId, timer);
    },
    [baseUrl, fetchTasks]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      try {
        setIsSaving(true);
        const response = await fetch(`${baseUrl}/${taskId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete task');
        }
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete task');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [baseUrl]
  );

  // Move a task up or down
  const moveTask = useCallback(
    async (taskId: string, direction: 'up' | 'down') => {
      const currentIndex = tasks.findIndex((t) => t.id === taskId);
      if (currentIndex === -1) return;

      const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (swapIndex < 0 || swapIndex >= tasks.length) return;

      // Optimistic reorder
      const reordered = [...tasks];
      [reordered[currentIndex], reordered[swapIndex]] = [reordered[swapIndex], reordered[currentIndex]];
      const items = reordered.map((t, i) => ({ id: t.id, order: i }));
      setTasks(reordered.map((t, i) => ({ ...t, order: i })));

      try {
        setIsSaving(true);
        const response = await fetch(`${baseUrl}/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
        if (!response.ok) {
          throw new Error('Failed to reorder');
        }
      } catch {
        await fetchTasks();
      } finally {
        setIsSaving(false);
      }
    },
    [tasks, baseUrl, fetchTasks]
  );

  return {
    tasks,
    isLoading,
    isSaving,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    refetch: fetchTasks,
  };
}
