This task modifies lib/types/blocks.ts and lib/tiptap/sync.ts. No database changes. No other files modified.

GOAL: Add _type discriminator fields to all block content interfaces and split ContentScreenContent into per-screenType sub-interfaces that match what sync.ts actually handles.

FILE 1: lib/types/blocks.ts

Make these changes:

1. Add a _type discriminator field to EVERY content interface. The _type field should be the FIRST field in each interface. Use these values:

   ParagraphContent           → _type: 'paragraph'
   HeadingContent             → _type: 'heading'
   ListContent                → _type: 'list'
   CalloutContent             → _type: 'callout'
   StoryboardMetadataContent  → _type: 'storyboardMetadata'
   LearningObjectivesImportContent → _type: 'learningObjectivesImport'
   ChecklistContent           → _type: 'checklist'
   TableContent               → _type: 'table'
   FacilitatorNotesContent    → _type: 'facilitatorNotes'
   MaterialsListContent       → _type: 'materialsList'
   ImageContent               → _type: 'image'
   VideoContent               → _type: 'video'
   StoryboardFrameContent     → _type: 'storyboardFrame'

2. Replace the flat ContentScreenContent interface with a base interface and per-screenType sub-interfaces. The base has shared fields, each sub-interface adds screenType-specific fields. These MUST match the fields that sync.ts already reads and writes.

   Replace ContentScreenContent with:

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

3. Add type guard functions after the BlockContent union type:

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

4. Update the createDefaultContentScreenContent factory to include _type:

   Change the return to include _type: 'contentScreen' as the first field.

5. Update ALL other createDefault* factories to include the appropriate _type field as the first field in the returned object.

6. Update the BlockContent union type to use ContentScreenContent (the union of sub-types) instead of the old flat interface. Remove the old flat ContentScreenContent from the union if needed. Make sure all the sub-type interfaces (ContentScreen_Content, ContentScreen_Video, etc.) are exported.

FILE 2: lib/tiptap/sync.ts

In the nodeToBlock function, after the content object is built for each case, inject the _type discriminator into the content. The simplest approach:

For the 'contentScreen' case, add _type: 'contentScreen' to the content object.
For the 'learningObjectivesImport' case, add _type: 'learningObjectivesImport' to the content object.
For the 'paragraph' case, add _type: 'paragraph' to the content object.
For the 'heading' case, add _type: 'heading' to the content object.
For the 'bulletList' case, add _type: 'list' to the content object.
For the 'orderedList' case, add _type: 'list' to the content object.
For the 'blockquote' case, add _type: 'callout' to the content object.
For the default fallback case, add _type: 'paragraph' to the content object.

Also in the blocksToTipTap direction (blockToNode function), there is nothing to change — the _type field in the content JSON will simply be carried through as part of the content object.

IMPORTANT: Do not change the structure of sync.ts beyond adding _type fields. The sync layer must continue to work exactly as it does now. Just add the _type field to each content object in nodeToBlock.

After making all changes, verify there are no TypeScript errors by running: npx tsc --noEmit
If tsc is not available or errors are unrelated to these changes, run: npx next build
