/**
 * Block content type definitions for the TipTap-based Storyboard Editor.
 * Each block type has its own content schema stored in Block.content JSON field.
 */

import { BlockType } from '@prisma/client';

// =============================================================================
// Basic Block Content Types (using existing BlockType enum values)
// =============================================================================

export interface ParagraphContent {
  _type: 'paragraph';
  text: string;
}

export interface HeadingContent {
  _type: 'heading';
  text: string;
  level: 1 | 2 | 3;
}

export interface ListContent {
  _type: 'list';
  items: string[];
}

export interface CalloutContent {
  _type: 'callout';
  text: string;
  variant: 'info' | 'tip' | 'warning' | 'important' | 'example';
  title?: string;
}

// =============================================================================
// Storyboard-Specific Block Content Types (new BlockType values - Milestone 2)
// =============================================================================

export interface StoryboardMetadataContent {
  _type: 'storyboardMetadata';
  courseTitle: string;
  audienceDescription: string;
  estimatedDuration: string;
  deliveryMechanism: 'elearning' | 'ilt' | 'vilt' | 'blended';
  linkedObjectiveIds: string[];
  version: number;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED';
}

interface ContentScreenBase {
  _type: 'contentScreen';
  screenId: string;
  screenTitle: string;
  screenType: 'content' | 'video' | 'practice' | 'assessment' | 'scenario' | 'title_intro';
  duration: string;
  designerNotes: string;
  developerNotes: string;
  visualsAssetId?: string | null;
  backgroundAssetId?: string | null;
}

export interface ContentScreen_Content extends ContentScreenBase {
  screenType: 'content';
  visuals: string;
  onScreenText: string;
  voiceoverScript: string;
  interactionType: 'none' | 'click_reveal' | 'drag_drop' | 'multiple_choice' | 'branching' | 'discussion' | 'exercise' | 'video_playback' | 'other';
  interactionDetails: string;
}

export interface ContentScreen_Video extends ContentScreenBase {
  screenType: 'video';
  videoSource: string;
  scenes: Array<{
    timecode: string;
    visualDescription: string;
    voiceover: string;
    onScreenText: string;
    assetId?: string | null;
  }>;
}

export interface ContentScreen_Practice extends ContentScreenBase {
  screenType: 'practice';
  activityType: string;
  activityDescription: string;
  instructions: string;
  hints: string;
  correctFeedback: string;
  incorrectFeedback: string;
}

export interface ContentScreen_Assessment extends ContentScreenBase {
  screenType: 'assessment';
  assessmentPurpose: string;
  assessmentFormat: string;
  assessmentFormatOther: string;
  linkedObjectiveIds: string[];
  cognitiveDemand: string;
  assessmentRationale: string[];
  assessmentRationaleOther: string;
  estimatedDuration: string;
  attemptsAllowed: string;
  gradedWeighted: string;
  dynamicScopeValue: string;
  feedbackStrategy: string;
  passingCriteria: string;
}

export interface ContentScreen_Scenario extends ContentScreenBase {
  screenType: 'scenario';
  scenarioSetup: string;
  decisionPrompt: string;
  scenarioOptions: Array<{
    label: string;
    consequence: string;
    isCorrect: boolean;
  }>;
  debrief: string;
}

export interface ContentScreen_TitleIntro extends ContentScreenBase {
  screenType: 'title_intro';
  titleCardText: string;
  briefVoiceover: string;
  backgroundNotes: string;
}

export type ContentScreenContent =
  | ContentScreen_Content
  | ContentScreen_Video
  | ContentScreen_Practice
  | ContentScreen_Assessment
  | ContentScreen_Scenario
  | ContentScreen_TitleIntro;

export interface LearningObjectivesImportContent {
  _type: 'learningObjectivesImport';
  importedAt: string;
  objectives: Array<{
    id: string;
    text: string;
    bloomLevel: string;
  }>;
  displayMode: 'compact' | 'detailed';
}

export interface ChecklistContent {
  _type: 'checklist';
  title: string;
  items: Array<{
    id: string;
    task: string;
    responsible: string;
    dueDate: string | null;
    completed: boolean;
    notes: string;
  }>;
}

export interface TableContent {
  _type: 'table';
  title: string;
  columns: Array<{
    id: string;
    header: string;
    width?: number;
    type: 'text' | 'number' | 'date' | 'select';
    options?: string[];
  }>;
  rows: Array<{
    id: string;
    cells: Record<string, string | number>;
  }>;
}

export interface FacilitatorNotesContent {
  _type: 'facilitatorNotes';
  sectionTitle: string;
  timing: string;
  activityType: 'lecture' | 'discussion' | 'activity' | 'break' | 'assessment';
  facilitatorInstructions: string;
  talkingPoints: string[];
  expectedOutcomes: string;
  materialsNeeded: string[];
}

export interface MaterialsListContent {
  _type: 'materialsList';
  title: string;
  categories: Array<{
    name: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number | string;
      notes: string;
      required: boolean;
    }>;
  }>;
}

export interface ImageContent {
  _type: 'image';
  src: string;
  alt: string;
  title: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface VideoContent {
  _type: 'video';
  src: string;
  videoType: 'youtube' | 'vimeo' | 'file';
  title: string;
  poster?: string;
  caption?: string;
}

// =============================================================================
// Legacy Block Content Type (for migration)
// =============================================================================

export interface StoryboardFrameContent {
  _type: 'storyboardFrame';
  sceneTitle: string;
  durationSeconds: number;
  script: string;
  onScreenText: string;
  visualDescription: string;
  audioNotes: string;
  transition: string;
  notes: string;
}

// =============================================================================
// Union type for all block content
// =============================================================================

export type BlockContent =
  | ParagraphContent
  | HeadingContent
  | ListContent
  | CalloutContent
  | StoryboardMetadataContent
  | ContentScreenContent
  | LearningObjectivesImportContent
  | ChecklistContent
  | TableContent
  | FacilitatorNotesContent
  | MaterialsListContent
  | ImageContent
  | VideoContent
  | StoryboardFrameContent
  | Record<string, unknown>; // Fallback for unknown content

// =============================================================================
// Type guards
// =============================================================================

export function isContentScreen(content: BlockContent): content is ContentScreenContent {
  return typeof content === 'object' && content !== null && '_type' in content && (content as any)._type === 'contentScreen';
}

export function isVideoScreen(content: BlockContent): content is ContentScreen_Video {
  return isContentScreen(content) && content.screenType === 'video';
}

export function isAssessmentScreen(content: BlockContent): content is ContentScreen_Assessment {
  return isContentScreen(content) && content.screenType === 'assessment';
}

export function isScenarioScreen(content: BlockContent): content is ContentScreen_Scenario {
  return isContentScreen(content) && content.screenType === 'scenario';
}

// =============================================================================
// Block interface matching database model
// =============================================================================

export interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
  pageId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// TipTap node name to BlockType mapping
// =============================================================================

export const TIPTAP_NODE_TO_BLOCK_TYPE: Record<string, BlockType> = {
  // M1: Basic blocks
  paragraph: 'PARAGRAPH',
  heading: 'HEADING_1', // Actual level determined by heading.attrs.level attribute
  bulletList: 'BULLETED_LIST',
  orderedList: 'NUMBERED_LIST',
  blockquote: 'CALLOUT',

  // M2: Storyboard blocks
  storyboardMetadata: 'STORYBOARD_METADATA',
  contentScreen: 'CONTENT_SCREEN',
  learningObjectivesImport: 'LEARNING_OBJECTIVES_IMPORT',
  checklist: 'CHECKLIST',
  customTable: 'TABLE', // Named customTable to avoid conflict with HTML table element
  facilitatorNotes: 'FACILITATOR_NOTES',
  materialsList: 'MATERIALS_LIST',

  // M2.5: Media blocks
  image: 'IMAGE',
  video: 'VIDEO',
};

export const BLOCK_TYPE_TO_TIPTAP_NODE: Record<string, string> = {
  // M1: Basic blocks
  PARAGRAPH: 'paragraph',
  HEADING_1: 'heading', // All heading levels map to 'heading' node with level attribute
  HEADING_2: 'heading',
  HEADING_3: 'heading',
  BULLETED_LIST: 'bulletList',
  NUMBERED_LIST: 'orderedList',
  CALLOUT: 'blockquote',

  // M2: Storyboard blocks
  STORYBOARD_METADATA: 'storyboardMetadata',
  CONTENT_SCREEN: 'contentScreen',
  LEARNING_OBJECTIVES_IMPORT: 'learningObjectivesImport',
  CHECKLIST: 'checklist',
  TABLE: 'customTable', // Named customTable to avoid conflict with HTML table element
  FACILITATOR_NOTES: 'facilitatorNotes',
  MATERIALS_LIST: 'materialsList',

  // M2.5: Media blocks
  IMAGE: 'image',
  VIDEO: 'video',
};

// =============================================================================
// Default content factories
// =============================================================================

export function createDefaultParagraphContent(): ParagraphContent {
  return { _type: 'paragraph', text: '' };
}

export function createDefaultHeadingContent(level: 1 | 2 | 3 = 1): HeadingContent {
  return { _type: 'heading', text: '', level };
}

export function createDefaultCalloutContent(): CalloutContent {
  return { _type: 'callout', text: '', variant: 'info' };
}

export function createDefaultContentScreenContent(screenNumber: number): ContentScreen_Content {
  return {
    _type: 'contentScreen',
    screenId: `SCR-${String(screenNumber).padStart(3, '0')}`,
    screenTitle: '',
    screenType: 'content',
    duration: '',
    designerNotes: '',
    developerNotes: '',
    visuals: '',
    onScreenText: '',
    voiceoverScript: '',
    interactionType: 'none',
    interactionDetails: '',
  };
}

export function createDefaultStoryboardMetadataContent(): StoryboardMetadataContent {
  return {
    _type: 'storyboardMetadata',
    courseTitle: '',
    audienceDescription: '',
    estimatedDuration: '',
    deliveryMechanism: 'elearning',
    linkedObjectiveIds: [],
    version: 1,
    status: 'DRAFT',
  };
}

export function createDefaultChecklistContent(): ChecklistContent {
  return {
    _type: 'checklist',
    title: 'Checklist',
    items: [],
  };
}

export function createDefaultTableContent(): TableContent {
  return {
    _type: 'table',
    title: 'Table',
    columns: [
      { id: 'col1', header: 'Column 1', type: 'text' },
      { id: 'col2', header: 'Column 2', type: 'text' },
    ],
    rows: [],
  };
}

export function createDefaultImageContent(): ImageContent {
  return {
    _type: 'image',
    src: '',
    alt: '',
    title: '',
  };
}

export function createDefaultVideoContent(): VideoContent {
  return {
    _type: 'video',
    src: '',
    videoType: 'youtube',
    title: '',
  };
}
