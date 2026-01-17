'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useEditor, Editor, JSONContent } from '@tiptap/react';
import { getStoryboardExtensions } from '@/lib/tiptap/extensions';
import { blocksToTipTap, tipTapToBlocks, SyncResult } from '@/lib/tiptap/sync';
import { Block } from '@/lib/types/blocks';

// =============================================================================
// Types
// =============================================================================

export interface PageMetadata {
  id: string;
  title: string;
  type: string;
  projectId: string;
  workspaceId: string;
}

export interface UseStoryboardEditorOptions {
  pageId: string;
  readOnly?: boolean;
  autosaveDelay?: number;
}

export interface UseStoryboardEditorReturn {
  editor: Editor | null;
  pageMetadata: PageMetadata | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSaved: Date | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  save: () => Promise<void>;
  refetch: () => Promise<void>;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_AUTOSAVE_DELAY = 2000; // 2 seconds

// =============================================================================
// Hook Implementation
// =============================================================================

export function useStoryboardEditor({
  pageId,
  readOnly = false,
  autosaveDelay = DEFAULT_AUTOSAVE_DELAY,
}: UseStoryboardEditorOptions): UseStoryboardEditorReturn {
  // State
  const [pageMetadata, setPageMetadata] = useState<PageMetadata | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Refs for autosave
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<JSONContent | null>(null);
  const blocksRef = useRef<Block[]>([]);
  const editorRef = useRef<Editor | null>(null);

  // Keep blocksRef in sync
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Memoize extensions
  const extensions = useMemo(() => getStoryboardExtensions(), []);

  // ==========================================================================
  // TipTap Editor - Create first so we can reference it
  // ==========================================================================

  const editor = useEditor({
    extensions,
    editable: !readOnly,
    immediatelyRender: false, // Avoid initial render until editor is mounted
    content: { type: 'doc', content: [{ type: 'paragraph' }] },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-[500px] max-w-none',
      },
    },
  });

  // Keep editorRef in sync
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // ==========================================================================
  // API Functions
  // ==========================================================================

  /**
   * Fetch page and blocks from API
   */
  const fetchPage = useCallback(async (): Promise<void> => {
    if (!pageId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/pages/${pageId}`);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 404) {
          throw new Error('Page not found');
        }
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch page');
      }

      const data = await response.json();

      setPageMetadata({
        id: data.id,
        title: data.title,
        type: data.type,
        projectId: data.projectId,
        workspaceId: data.workspaceId,
      });

      const fetchedBlocks = (data.blocks || []) as Block[];
      setBlocks(fetchedBlocks);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch page';
      setError(message);
      console.error('Error fetching page:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  /**
   * Result from persistChanges including created block IDs
   */
  interface PersistResult {
    success: boolean;
    createdBlocks: Array<{ order: number; id: string; type: string; content: Record<string, unknown> }>;
  }

  /**
   * Persist changes to the API
   */
  const persistChanges = useCallback(
    async (syncResult: SyncResult): Promise<PersistResult> => {
      if (!pageId) return { success: false, createdBlocks: [] };

      try {
        // Create new blocks - do these first and track responses
        const createPromises = syncResult.toCreate.map(async (block) => {
          const response = await fetch(`/api/pages/${pageId}/blocks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: block.type,
              content: block.content,
              order: block.order,
            }),
          });
          return { response, originalOrder: block.order, type: block.type, content: block.content };
        });

        const createResults = await Promise.all(createPromises);

        // Parse created block responses to get IDs
        const createdBlocks: PersistResult['createdBlocks'] = [];
        for (const result of createResults) {
          if (result.response.ok) {
            const data = await result.response.json();
            createdBlocks.push({
              order: result.originalOrder,
              id: data.id,
              type: result.type,
              content: result.content as Record<string, unknown>,
            });
          } else {
            console.error('Failed to create block:', await result.response.text());
            return { success: false, createdBlocks: [] };
          }
        }

        // Update existing blocks
        const updatePromises = syncResult.toUpdate.map((update) =>
          fetch(`/api/pages/${pageId}/blocks/${update.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: update.content }),
          })
        );

        // Delete removed blocks
        const deletePromises = syncResult.toDelete.map((blockId) =>
          fetch(`/api/pages/${pageId}/blocks/${blockId}`, {
            method: 'DELETE',
          })
        );

        // Reorder if needed
        const reorderPromise = syncResult.orderUpdates.length > 0
          ? fetch(`/api/pages/${pageId}/blocks/reorder`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ blocks: syncResult.orderUpdates }),
            })
          : null;

        // Execute update calls
        const updateResults = await Promise.all(updatePromises);
        const updateFailed = updateResults.filter((r) => !r.ok);
        if (updateFailed.length > 0) {
          console.error('Some update calls failed:', updateFailed);
          return { success: false, createdBlocks };
        }

        // Execute delete calls - treat 404 as success (already deleted)
        const deleteResults = await Promise.all(deletePromises);
        const deleteFailed = deleteResults.filter((r) => !r.ok && r.status !== 404);
        if (deleteFailed.length > 0) {
          console.error('Some delete calls failed:', deleteFailed);
          return { success: false, createdBlocks };
        }

        // Execute reorder call
        if (reorderPromise) {
          const reorderResult = await reorderPromise;
          if (!reorderResult.ok) {
            console.error('Reorder call failed');
            return { success: false, createdBlocks };
          }
        }

        return { success: true, createdBlocks };
      } catch (err) {
        console.error('Error persisting changes:', err);
        return { success: false, createdBlocks: [] };
      }
    },
    [pageId]
  );

  /**
   * Save current editor content to API
   */
  const save = useCallback(async (): Promise<void> => {
    const currentEditor = editorRef.current;
    if (!currentEditor || currentEditor.isDestroyed || readOnly) {
      return;
    }

    const currentContent = currentEditor.getJSON();

    // Skip if content hasn't changed since last save
    if (
      lastContentRef.current &&
      JSON.stringify(lastContentRef.current) === JSON.stringify(currentContent)
    ) {
      setSaveStatus('idle');
      return;
    }

    // Calculate sync operations before we start saving
    const syncResult = tipTapToBlocks(currentContent, blocksRef.current);

    // Skip if there's nothing to sync
    if (
      syncResult.toCreate.length === 0 &&
      syncResult.toUpdate.length === 0 &&
      syncResult.toDelete.length === 0 &&
      syncResult.orderUpdates.length === 0
    ) {
      lastContentRef.current = currentContent;
      setSaveStatus('idle');
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');
    setError(null);

    try {
      // Persist to API
      const result = await persistChanges(syncResult);

      if (result.success) {
        // Update local blocks state to match what was persisted
        const currentBlocks = blocksRef.current;

        // Start with existing blocks, remove deleted ones
        let newBlocks = currentBlocks.filter(b => !syncResult.toDelete.includes(b.id));

        // Update modified blocks
        newBlocks = newBlocks.map(b => {
          const update = syncResult.toUpdate.find(u => u.id === b.id);
          if (update) {
            return { ...b, content: update.content as Block['content'] };
          }
          return b;
        });

        // Add newly created blocks to local state
        for (const created of result.createdBlocks) {
          newBlocks.push({
            id: created.id,
            type: created.type as Block['type'],
            content: created.content as Block['content'],
            pageId: pageId,
            order: created.order,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        // Sort by order
        newBlocks.sort((a, b) => a.order - b.order);

        setBlocks(newBlocks);
        blocksRef.current = newBlocks;

        // Update TipTap nodes with new blockIds for created blocks
        // This prevents duplicate creation on next save
        if (result.createdBlocks.length > 0 && currentContent.content) {
          const updatedContent = { ...currentContent };
          updatedContent.content = currentContent.content.map((node, index) => {
            // Check if this node position matches a created block
            const createdBlock = result.createdBlocks.find(b => b.order === index);
            if (createdBlock && (!node.attrs?.blockId)) {
              return {
                ...node,
                attrs: {
                  ...node.attrs,
                  blockId: createdBlock.id,
                },
              };
            }
            return node;
          });

          // Set the updated content back to editor without triggering another save
          // Use queueMicrotask to defer DOM update and avoid flushSync conflict
          lastContentRef.current = updatedContent;
          queueMicrotask(() => {
            if (!currentEditor.isDestroyed) {
              currentEditor.commands.setContent(updatedContent, { emitUpdate: false });
            }
          });
        } else {
          lastContentRef.current = currentContent;
        }

        setLastSaved(new Date());
        setSaveStatus('saved');
      } else {
        throw new Error('Failed to save some changes');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      setError(message);
      setSaveStatus('error');
      console.error('Error saving:', err);
    } finally {
      setIsSaving(false);
    }
  }, [readOnly, persistChanges, pageId]);

  // ==========================================================================
  // Editor update handler (set up after save is defined)
  // ==========================================================================

  useEffect(() => {
    if (!editor || readOnly) return;

    const handleUpdate = () => {
      // Clear existing autosave timer
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }

      // Schedule autosave after delay - don't show "saving" until we actually save
      // This allows markdown shortcuts to work without triggering immediate saves
      autosaveTimerRef.current = setTimeout(() => {
        save();
      }, autosaveDelay);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      // Clear timer on cleanup
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [editor, readOnly, autosaveDelay, save]);

  // ==========================================================================
  // Effects
  // ==========================================================================

  // Initial fetch
  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  // Update editor content on initial load only
  // We use a ref to track if initial content has been set
  const initialContentSetRef = useRef(false);

  useEffect(() => {
    // Only set content once on initial load, not after saves
    if (editor && !editor.isDestroyed && blocks.length > 0 && !initialContentSetRef.current) {
      const tiptapContent = blocksToTipTap(blocks);
      lastContentRef.current = tiptapContent;
      initialContentSetRef.current = true;
      // Use queueMicrotask to defer DOM update and avoid flushSync conflict
      queueMicrotask(() => {
        if (!editor.isDestroyed) {
          editor.commands.setContent(tiptapContent);
        }
      });
    }
  }, [editor, blocks]);

  // Reset the flag when pageId changes (navigating to different page)
  useEffect(() => {
    initialContentSetRef.current = false;
  }, [pageId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  // Reset saved status after a delay
  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    editor,
    pageMetadata,
    isLoading,
    isSaving,
    error,
    lastSaved,
    saveStatus,
    save,
    refetch: fetchPage,
  };
}

// =============================================================================
// Helper Hook: useEditorWordCount
// =============================================================================

export function useEditorWordCount(editor: Editor | null): number {
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const updateWordCount = () => {
      const text = editor.getText();
      const words = text.split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    };

    updateWordCount();
    editor.on('update', updateWordCount);

    return () => {
      editor.off('update', updateWordCount);
    };
  }, [editor]);

  return wordCount;
}
