'use client';

import { useState, useCallback, useEffect } from 'react';
import GuidancePanel from '@/components/ui/GuidancePanel';
import FrameList from '@/components/storyboard/FrameList';
import FrameEditor from '@/components/storyboard/FrameEditor';
import StoryboardHeader from '@/components/storyboard/StoryboardHeader';
import {
  StoryboardViewProps,
  StoryboardFrame,
  StoryboardMetadata,
  StoryboardFrameContent,
  defaultMetadata,
  createEmptyFrameContent,
} from '@/lib/types/storyboard';

export default function StoryboardView({
  courseId,
  pageId,
  pageTitle,
  initialMetadata,
  initialFrames,
}: StoryboardViewProps) {
  const [metadata, setMetadata] = useState<StoryboardMetadata>({
    ...defaultMetadata,
    ...initialMetadata,
  });
  const [frames, setFrames] = useState<StoryboardFrame[]>(initialFrames || []);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const selectedFrame = frames.find((f) => f.id === selectedFrameId);

  // Auto-select first frame if none selected
  useEffect(() => {
    if (!selectedFrameId && frames.length > 0) {
      setSelectedFrameId(frames[0].id);
    }
  }, [selectedFrameId, frames]);

  // Save metadata to API
  const handleSaveMetadata = useCallback(async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/pages/${pageId}/storyboard`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      setSaveMessage({ text: 'Saved successfully', type: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      setSaveMessage({ text: message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, [pageId, metadata]);

  // Create a new frame
  const handleAddFrame = useCallback(async () => {
    try {
      const content = createEmptyFrameContent();
      const response = await fetch(`/api/pages/${pageId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'STORYBOARD_FRAME',
          content,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create frame');
      }

      const block = await response.json();
      const newFrame: StoryboardFrame = {
        id: block.id,
        order: block.order,
        ...content,
      };

      setFrames((prev) => [...prev, newFrame].sort((a, b) => a.order - b.order));
      setSelectedFrameId(block.id);
      setSaveMessage(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add frame';
      setSaveMessage({ text: message, type: 'error' });
    }
  }, [pageId]);

  // Update a frame
  const handleUpdateFrame = useCallback(
    async (frameId: string, updates: Partial<StoryboardFrameContent>) => {
      const frame = frames.find((f) => f.id === frameId);
      if (!frame) return;

      // Optimistic update
      const updatedContent: StoryboardFrameContent = {
        sceneTitle: updates.sceneTitle ?? frame.sceneTitle,
        durationSeconds: updates.durationSeconds ?? frame.durationSeconds,
        script: updates.script ?? frame.script,
        onScreenText: updates.onScreenText ?? frame.onScreenText,
        visualDescription: updates.visualDescription ?? frame.visualDescription,
        audioNotes: updates.audioNotes ?? frame.audioNotes,
        transition: updates.transition ?? frame.transition,
        notes: updates.notes ?? frame.notes,
      };

      setFrames((prev) =>
        prev.map((f) => (f.id === frameId ? { ...f, ...updatedContent } : f))
      );
      setSaveMessage(null);

      try {
        const response = await fetch(`/api/pages/${pageId}/blocks/${frameId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: updatedContent }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update frame');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update';
        setSaveMessage({ text: message, type: 'error' });
        // Revert on error
        setFrames((prev) => prev.map((f) => (f.id === frameId ? frame : f)));
      }
    },
    [pageId, frames]
  );

  // Delete a frame
  const handleDeleteFrame = useCallback(
    async (frameId: string) => {
      const frameIndex = frames.findIndex((f) => f.id === frameId);
      if (frameIndex === -1) return;

      // Optimistic update
      const deletedFrame = frames[frameIndex];
      setFrames((prev) => prev.filter((f) => f.id !== frameId));

      // Select adjacent frame
      if (selectedFrameId === frameId) {
        const newIndex = Math.min(frameIndex, frames.length - 2);
        setSelectedFrameId(newIndex >= 0 ? frames[newIndex === frameIndex ? newIndex + 1 : newIndex]?.id || null : null);
      }

      try {
        const response = await fetch(`/api/pages/${pageId}/blocks/${frameId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete frame');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete';
        setSaveMessage({ text: message, type: 'error' });
        // Revert on error
        setFrames((prev) => {
          const newFrames = [...prev];
          newFrames.splice(frameIndex, 0, deletedFrame);
          return newFrames;
        });
      }
    },
    [pageId, frames, selectedFrameId]
  );

  // Duplicate a frame
  const handleDuplicateFrame = useCallback(
    async (frameId: string) => {
      const frame = frames.find((f) => f.id === frameId);
      if (!frame) return;

      try {
        const content: StoryboardFrameContent = {
          sceneTitle: `${frame.sceneTitle} (Copy)`,
          durationSeconds: frame.durationSeconds,
          script: frame.script,
          onScreenText: frame.onScreenText,
          visualDescription: frame.visualDescription,
          audioNotes: frame.audioNotes,
          transition: frame.transition,
          notes: frame.notes,
        };

        const response = await fetch(`/api/pages/${pageId}/blocks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'STORYBOARD_FRAME',
            content,
            order: frame.order + 1,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to duplicate frame');
        }

        const block = await response.json();
        const newFrame: StoryboardFrame = {
          id: block.id,
          order: block.order,
          ...content,
        };

        // Refetch frames to get correct order
        const blocksResponse = await fetch(`/api/pages/${pageId}/blocks`);
        if (blocksResponse.ok) {
          const blocks = await blocksResponse.json();
          const storyboardFrames = blocks
            .filter((b: { type: string }) => b.type === 'STORYBOARD_FRAME')
            .map((b: { id: string; order: number; content: StoryboardFrameContent }) => ({
              id: b.id,
              order: b.order,
              ...(b.content as StoryboardFrameContent),
            }))
            .sort((a: StoryboardFrame, b: StoryboardFrame) => a.order - b.order);
          setFrames(storyboardFrames);
        } else {
          setFrames((prev) => [...prev, newFrame].sort((a, b) => a.order - b.order));
        }

        setSelectedFrameId(block.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to duplicate';
        setSaveMessage({ text: message, type: 'error' });
      }
    },
    [pageId, frames]
  );

  // Reorder frames
  const handleReorderFrames = useCallback(
    async (reorderedFrames: StoryboardFrame[]) => {
      const previousFrames = [...frames];
      setFrames(reorderedFrames);

      try {
        const response = await fetch(`/api/pages/${pageId}/blocks/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            reorderedFrames.map((f, index) => ({ id: f.id, order: index }))
          ),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to reorder frames');
        }

        // Update order values locally
        setFrames(reorderedFrames.map((f, index) => ({ ...f, order: index })));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reorder';
        setSaveMessage({ text: message, type: 'error' });
        setFrames(previousFrames);
      }
    },
    [pageId, frames]
  );

  // Handle metadata changes
  const handleMetadataChange = useCallback(
    (updates: Partial<StoryboardMetadata>) => {
      setMetadata((prev) => ({ ...prev, ...updates }));
      setSaveMessage(null);
    },
    []
  );

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <StoryboardHeader
        pageTitle={pageTitle}
        metadata={metadata}
        frames={frames}
        isSaving={isSaving}
        saveMessage={saveMessage}
        onMetadataChange={handleMetadataChange}
        onSave={handleSaveMetadata}
      />

      {/* Main Content - Two Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Frame List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Frames</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <FrameList
              frames={frames}
              selectedFrameId={selectedFrameId}
              onSelectFrame={setSelectedFrameId}
              onAddFrame={handleAddFrame}
              onDeleteFrame={handleDeleteFrame}
              onDuplicateFrame={handleDuplicateFrame}
              onReorderFrames={handleReorderFrames}
            />
          </div>
        </div>

        {/* Right Panel - Frame Editor */}
        <div className="flex-1 overflow-y-auto">
          {selectedFrame ? (
            <FrameEditor
              frame={selectedFrame}
              frameNumber={frames.findIndex((f) => f.id === selectedFrame.id) + 1}
              onUpdateFrame={handleUpdateFrame}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                {frames.length === 0 ? (
                  <>
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                      />
                    </svg>
                    <p className="text-lg font-medium mb-2">No frames yet</p>
                    <p className="text-sm mb-4">
                      Add your first frame to start building your storyboard
                    </p>
                    <button
                      type="button"
                      onClick={handleAddFrame}
                      className="bg-[#03428e] hover:bg-[#022d61] text-white font-medium px-4 py-2 rounded-lg inline-flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add First Frame
                    </button>
                  </>
                ) : (
                  <p>Select a frame to edit</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
