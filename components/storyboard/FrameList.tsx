'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { StoryboardFrame } from '@/lib/types/storyboard';
import SortableFrameThumbnail from './SortableFrameThumbnail';

interface FrameListProps {
  frames: StoryboardFrame[];
  selectedFrameId: string | null;
  onSelectFrame: (frameId: string) => void;
  onAddFrame: () => void;
  onDeleteFrame: (frameId: string) => void;
  onDuplicateFrame: (frameId: string) => void;
  onReorderFrames: (frames: StoryboardFrame[]) => void;
}

export default function FrameList({
  frames,
  selectedFrameId,
  onSelectFrame,
  onAddFrame,
  onDeleteFrame,
  onDuplicateFrame,
  onReorderFrames,
}: FrameListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = frames.findIndex((f) => f.id === active.id);
      const newIndex = frames.findIndex((f) => f.id === over.id);
      const newFrames = arrayMove(frames, oldIndex, newIndex);
      onReorderFrames(newFrames);
    }
  };

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={frames.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          {frames.map((frame, index) => (
            <SortableFrameThumbnail
              key={frame.id}
              frame={frame}
              frameNumber={index + 1}
              isSelected={selectedFrameId === frame.id}
              onSelect={() => onSelectFrame(frame.id)}
              onDelete={() => onDeleteFrame(frame.id)}
              onDuplicate={() => onDuplicateFrame(frame.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add Frame Button */}
      <button
        type="button"
        onClick={onAddFrame}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#03428e] hover:text-[#03428e] hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Frame
      </button>
    </div>
  );
}
