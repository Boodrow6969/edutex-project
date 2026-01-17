'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { BlockType, PageType } from '@prisma/client';

/**
 * Block data structure matching the API response
 */
export interface Block {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Page metadata from the API
 */
export interface PageData {
  id: string;
  title: string;
  type: PageType;
  order: number;
  projectId: string;
  workspaceId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  blocks: Block[];
}

/**
 * Hook return type
 */
export interface UsePageBlocksReturn {
  page: PageData | null;
  blocks: Block[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSaved: Date | null;
  addBlock: (type: BlockType, afterIndex?: number) => Promise<Block | null>;
  updateBlock: (blockId: string, content: Record<string, unknown>, type?: BlockType) => void;
  deleteBlock: (blockId: string) => Promise<boolean>;
  moveBlock: (blockId: string, direction: 'up' | 'down') => Promise<boolean>;
  refetch: () => Promise<void>;
}

// Debounce delay for content updates (ms)
const DEBOUNCE_DELAY = 500;

/**
 * Custom hook for managing page blocks with API persistence.
 * Provides optimistic updates with debounced saves for content changes.
 */
export function usePageBlocks(pageId: string): UsePageBlocksReturn {
  const [page, setPage] = useState<PageData | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Track pending updates for debouncing
  const pendingUpdates = useRef<Map<string, { content: Record<string, unknown>; type?: BlockType }>>(
    new Map()
  );
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Fetch page and blocks on mount
  const fetchPage = useCallback(async () => {
    if (!pageId) return;

    try {
      setError(null);
      const response = await fetch(`/api/pages/${pageId}`);

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required');
          return;
        }
        if (response.status === 404) {
          setError('Page not found');
          return;
        }
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch page');
      }

      const data: PageData = await response.json();
      setPage(data);
      setBlocks(data.blocks);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch page';
      setError(message);
      console.error('Error fetching page:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchPage();

    // Copy ref to local variable for cleanup
    const timers = debounceTimers.current;

    // Cleanup debounce timers on unmount
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [fetchPage]);

  /**
   * Flush a pending update to the API
   */
  const flushUpdate = useCallback(
    async (blockId: string) => {
      const update = pendingUpdates.current.get(blockId);
      if (!update) return;

      pendingUpdates.current.delete(blockId);
      setIsSaving(true);

      try {
        const response = await fetch(`/api/pages/${pageId}/blocks/${blockId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: update.content,
            ...(update.type && { type: update.type }),
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update block');
        }

        setLastSaved(new Date());
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save';
        setError(message);
        console.error('Error saving block:', err);
      } finally {
        // Check if there are more pending updates
        if (pendingUpdates.current.size === 0) {
          setIsSaving(false);
        }
      }
    },
    [pageId]
  );

  /**
   * Add a new block
   */
  const addBlock = useCallback(
    async (type: BlockType, afterIndex?: number): Promise<Block | null> => {
      setIsSaving(true);
      setError(null);

      try {
        const order = afterIndex !== undefined ? afterIndex + 1 : blocks.length;

        const response = await fetch(`/api/pages/${pageId}/blocks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            content: { text: '' },
            order,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create block');
        }

        const newBlock: Block = await response.json();

        // Insert block at the correct position and update subsequent orders
        setBlocks((prev) => {
          const updated = [...prev];
          if (afterIndex !== undefined) {
            // Insert after the specified index
            updated.splice(afterIndex + 1, 0, newBlock);
            // Update orders for subsequent blocks
            for (let i = afterIndex + 2; i < updated.length; i++) {
              updated[i] = { ...updated[i], order: i };
            }
          } else {
            updated.push(newBlock);
          }
          return updated;
        });

        setLastSaved(new Date());
        return newBlock;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add block';
        setError(message);
        console.error('Error adding block:', err);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [pageId, blocks.length]
  );

  /**
   * Update block content with debouncing
   */
  const updateBlock = useCallback(
    (blockId: string, content: Record<string, unknown>, type?: BlockType) => {
      // Optimistic update
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === blockId
            ? { ...block, content, ...(type && { type }) }
            : block
        )
      );

      // Store the pending update
      pendingUpdates.current.set(blockId, { content, type });

      // Clear existing timer for this block
      const existingTimer = debounceTimers.current.get(blockId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new debounce timer
      const timer = setTimeout(() => {
        flushUpdate(blockId);
        debounceTimers.current.delete(blockId);
      }, DEBOUNCE_DELAY);

      debounceTimers.current.set(blockId, timer);
      setIsSaving(true);
    },
    [flushUpdate]
  );

  /**
   * Delete a block
   */
  const deleteBlock = useCallback(
    async (blockId: string): Promise<boolean> => {
      // Cancel any pending update for this block
      const timer = debounceTimers.current.get(blockId);
      if (timer) {
        clearTimeout(timer);
        debounceTimers.current.delete(blockId);
      }
      pendingUpdates.current.delete(blockId);

      setIsSaving(true);
      setError(null);

      // Optimistic delete
      const previousBlocks = blocks;
      setBlocks((prev) => {
        const filtered = prev.filter((b) => b.id !== blockId);
        // Update orders
        return filtered.map((block, index) => ({ ...block, order: index }));
      });

      try {
        const response = await fetch(`/api/pages/${pageId}/blocks/${blockId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete block');
        }

        setLastSaved(new Date());
        return true;
      } catch (err) {
        // Rollback on error
        setBlocks(previousBlocks);
        const message = err instanceof Error ? err.message : 'Failed to delete block';
        setError(message);
        console.error('Error deleting block:', err);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [pageId, blocks]
  );

  /**
   * Move a block up or down
   */
  const moveBlock = useCallback(
    async (blockId: string, direction: 'up' | 'down'): Promise<boolean> => {
      const index = blocks.findIndex((b) => b.id === blockId);
      if (index === -1) return false;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return false;

      // Optimistic reorder
      const previousBlocks = blocks;
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];

      // Update orders
      const reorderedBlocks = newBlocks.map((block, idx) => ({
        ...block,
        order: idx,
      }));

      setBlocks(reorderedBlocks);
      setIsSaving(true);
      setError(null);

      try {
        const response = await fetch(`/api/pages/${pageId}/blocks/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blocks: reorderedBlocks.map((b) => ({ id: b.id, order: b.order })),
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to reorder blocks');
        }

        setLastSaved(new Date());
        return true;
      } catch (err) {
        // Rollback on error
        setBlocks(previousBlocks);
        const message = err instanceof Error ? err.message : 'Failed to move block';
        setError(message);
        console.error('Error moving block:', err);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [pageId, blocks]
  );

  return {
    page,
    blocks,
    isLoading,
    isSaving,
    error,
    lastSaved,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    refetch: fetchPage,
  };
}
