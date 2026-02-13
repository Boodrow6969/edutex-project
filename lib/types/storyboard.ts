// Storyboard Types for Video Storyboard Designer

export type TransitionType = 'cut' | 'fade' | 'dissolve' | 'wipe' | 'none';
export type StoryboardStatus = 'DRAFT' | 'REVIEW' | 'APPROVED';

// Block.content JSON structure for STORYBOARD_FRAME blocks
export interface StoryboardFrameContent {
  sceneTitle: string;
  durationSeconds: number;
  script: string;
  onScreenText: string;
  visualDescription: string;
  audioNotes: string;
  transition: TransitionType;
  notes: string;
}

// Page-level metadata (stored in Storyboard model)
export interface StoryboardMetadata {
  targetAudience: string;
  status: StoryboardStatus;
  linkedObjectiveIds: string[];
  version: number;
}

// Combined view model for the component (Block data + content)
export interface StoryboardFrame extends StoryboardFrameContent {
  id: string; // Block.id
  order: number; // Block.order
}

// Props for the main StoryboardView component
export interface StoryboardViewProps {
  courseId: string;
  pageId: string;
  pageTitle: string;
  initialMetadata?: StoryboardMetadata;
  initialFrames?: StoryboardFrame[];
}

// Factory function to create empty frame content
export const createEmptyFrameContent = (): StoryboardFrameContent => ({
  sceneTitle: '',
  durationSeconds: 30,
  script: '',
  onScreenText: '',
  visualDescription: '',
  audioNotes: '',
  transition: 'cut',
  notes: '',
});

// Default metadata for new storyboards
export const defaultMetadata: StoryboardMetadata = {
  targetAudience: '',
  status: 'DRAFT',
  linkedObjectiveIds: [],
  version: 1,
};

// Helper to calculate total duration from frames
export const calculateTotalDuration = (frames: StoryboardFrame[]): number => {
  return frames.reduce((sum, frame) => sum + (frame.durationSeconds || 0), 0);
};

// Helper to format duration as MM:SS
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Status display configuration
export const statusConfig: Record<
  StoryboardStatus,
  { label: string; color: string; bgColor: string }
> = {
  DRAFT: {
    label: 'Draft',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
  REVIEW: {
    label: 'In Review',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  APPROVED: {
    label: 'Approved',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
};

// Transition options for dropdown
export const transitionOptions: { value: TransitionType; label: string }[] = [
  { value: 'cut', label: 'Cut' },
  { value: 'fade', label: 'Fade' },
  { value: 'dissolve', label: 'Dissolve' },
  { value: 'wipe', label: 'Wipe' },
  { value: 'none', label: 'None' },
];
