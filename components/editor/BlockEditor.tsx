'use client';

import { useState } from 'react';
import { BlockType } from '@prisma/client';
import { usePageBlocks, Block } from '@/lib/hooks/usePageBlocks';

interface BlockEditorProps {
  pageId: string;
}

/**
 * Block-based page editor with API persistence.
 * Uses usePageBlocks hook for state management and saves.
 */
export default function BlockEditor({ pageId }: BlockEditorProps) {
  const {
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
  } = usePageBlocks(pageId);

  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  const handleAddBlock = async (type: BlockType, afterIndex?: number) => {
    const newBlock = await addBlock(type, afterIndex);
    if (newBlock) {
      setFocusedBlockId(newBlock.id);
    }
  };

  const handleUpdateBlock = (id: string, content: Record<string, unknown>) => {
    updateBlock(id, content);
  };

  const handleDeleteBlock = async (id: string) => {
    await deleteBlock(id);
    setFocusedBlockId(null);
  };

  const handleMoveBlock = async (id: string, direction: 'up' | 'down') => {
    await moveBlock(id, direction);
  };

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return lastSaved.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading page...</span>
        </div>
      </div>
    );
  }

  if (error && !page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-red-500 text-sm mt-2">
            Unable to load page content. Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with save status */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          {page && (
            <h1 className="text-xl font-semibold text-gray-900">{page.title}</h1>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Error indicator */}
          {error && (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              {error}
            </span>
          )}
          {/* Save status indicator */}
          <div className="flex items-center gap-2 text-sm">
            {isSaving ? (
              <>
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-500">Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-500">Saved {formatLastSaved()}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Block Menu */}
      <div className="mb-6 flex gap-2 flex-wrap p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <button
          onClick={() => handleAddBlock('PARAGRAPH')}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          + Paragraph
        </button>
        <button
          onClick={() => handleAddBlock('HEADING_1')}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          + Heading 1
        </button>
        <button
          onClick={() => handleAddBlock('HEADING_2')}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          + Heading 2
        </button>
        <button
          onClick={() => handleAddBlock('BULLETED_LIST')}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          + Bullet List
        </button>
        <button
          onClick={() => handleAddBlock('CALLOUT')}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          + Callout
        </button>
        <button
          onClick={() => handleAddBlock('LEARNING_OBJECTIVE')}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white border border-blue-700 rounded hover:bg-blue-700"
        >
          + Learning Objective
        </button>
      </div>

      {/* Blocks */}
      <div className="space-y-4">
        {blocks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">No blocks yet. Add one to get started!</p>
            <button
              onClick={() => handleAddBlock('PARAGRAPH')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Paragraph
            </button>
          </div>
        ) : (
          blocks.map((block, index) => (
            <BlockComponent
              key={block.id}
              block={block}
              isFocused={focusedBlockId === block.id}
              onFocus={() => setFocusedBlockId(block.id)}
              onUpdate={(content) => handleUpdateBlock(block.id, content)}
              onDelete={() => handleDeleteBlock(block.id)}
              onMoveUp={() => handleMoveBlock(block.id, 'up')}
              onMoveDown={() => handleMoveBlock(block.id, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < blocks.length - 1}
              onAddBlock={(type) => handleAddBlock(type, index)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface BlockComponentProps {
  block: Block;
  isFocused: boolean;
  onFocus: () => void;
  onUpdate: (content: Record<string, unknown>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onAddBlock: (type: BlockType) => void;
}

function BlockComponent({
  block,
  isFocused,
  onFocus,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: BlockComponentProps) {
  // Safely get text content
  const getText = (): string => {
    const content = block.content as Record<string, unknown>;
    return typeof content?.text === 'string' ? content.text : '';
  };

  // Safely get bloom level
  const getBloomLevel = (): string => {
    const content = block.content as Record<string, unknown>;
    return typeof content?.bloomLevel === 'string' ? content.bloomLevel : 'APPLY';
  };

  // Safely get tags
  const getTags = (): string[] => {
    const content = block.content as Record<string, unknown>;
    return Array.isArray(content?.tags) ? (content.tags as string[]) : [];
  };

  const renderBlock = () => {
    const commonClasses =
      'w-full p-3 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

    switch (block.type) {
      case 'HEADING_1':
        return (
          <input
            type="text"
            value={getText()}
            onChange={(e) => onUpdate({ text: e.target.value })}
            onFocus={onFocus}
            placeholder="Heading 1"
            className={`${commonClasses} text-3xl font-bold`}
          />
        );
      case 'HEADING_2':
        return (
          <input
            type="text"
            value={getText()}
            onChange={(e) => onUpdate({ text: e.target.value })}
            onFocus={onFocus}
            placeholder="Heading 2"
            className={`${commonClasses} text-2xl font-semibold`}
          />
        );
      case 'HEADING_3':
        return (
          <input
            type="text"
            value={getText()}
            onChange={(e) => onUpdate({ text: e.target.value })}
            onFocus={onFocus}
            placeholder="Heading 3"
            className={`${commonClasses} text-xl font-semibold`}
          />
        );
      case 'CALLOUT':
        return (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <textarea
              value={getText()}
              onChange={(e) => onUpdate({ text: e.target.value })}
              onFocus={onFocus}
              placeholder="Callout text..."
              className="w-full bg-transparent focus:outline-none resize-none"
              rows={3}
            />
          </div>
        );
      case 'LEARNING_OBJECTIVE':
        return (
          <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded space-y-3">
            <textarea
              value={getText()}
              onChange={(e) =>
                onUpdate({
                  ...block.content,
                  text: e.target.value,
                })
              }
              onFocus={onFocus}
              placeholder="The learner will be able to..."
              className="w-full bg-transparent focus:outline-none resize-none font-medium"
              rows={2}
            />
            <div className="flex gap-3">
              <select
                value={getBloomLevel()}
                onChange={(e) =>
                  onUpdate({
                    ...block.content,
                    bloomLevel: e.target.value,
                  })
                }
                className="px-3 py-1 text-sm border border-gray-300 rounded bg-white"
              >
                <option value="REMEMBER">Remember</option>
                <option value="UNDERSTAND">Understand</option>
                <option value="APPLY">Apply</option>
                <option value="ANALYZE">Analyze</option>
                <option value="EVALUATE">Evaluate</option>
                <option value="CREATE">Create</option>
              </select>
              <input
                type="text"
                value={getTags().join(', ')}
                onChange={(e) =>
                  onUpdate({
                    ...block.content,
                    tags: e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter((t) => t),
                  })
                }
                placeholder="Tags (comma-separated)"
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          </div>
        );
      case 'BULLETED_LIST':
      case 'NUMBERED_LIST':
        return (
          <textarea
            value={getText()}
            onChange={(e) => onUpdate({ text: e.target.value })}
            onFocus={onFocus}
            placeholder="List items (one per line)"
            className={`${commonClasses} font-mono text-sm`}
            rows={5}
          />
        );
      case 'PARAGRAPH':
      default:
        return (
          <textarea
            value={getText()}
            onChange={(e) => onUpdate({ text: e.target.value })}
            onFocus={onFocus}
            placeholder="Start typing..."
            className={commonClasses}
            rows={4}
          />
        );
    }
  };

  return (
    <div
      className={`group relative ${
        isFocused ? 'ring-2 ring-blue-500 rounded' : ''
      }`}
    >
      {renderBlock()}

      {/* Block Controls */}
      {isFocused && (
        <div className="absolute -left-12 top-0 flex flex-col gap-1">
          {canMoveUp && (
            <button
              onClick={onMoveUp}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Move up"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          )}
          {canMoveDown && (
            <button
              onClick={onMoveDown}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Move down"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Block Type Indicator */}
      <div className="absolute -left-2 top-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
        {block.type.toLowerCase().replace('_', ' ')}
      </div>
    </div>
  );
}
