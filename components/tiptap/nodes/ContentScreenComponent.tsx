'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Monitor, ChevronDown, ChevronUp, Trash2, Plus, X } from 'lucide-react';
import { AssetAttachment } from '@/components/assets';

// =============================================================================
// Types
// =============================================================================

type ScreenType = 'content' | 'video' | 'practice' | 'assessment' | 'scenario' | 'title_intro';
type InteractionType = 'none' | 'click_reveal' | 'drag_drop' | 'multiple_choice' | 'branching' | 'discussion' | 'exercise' | 'video_playback' | 'other';
type ActivityType = 'drag_drop' | 'click_reveal' | 'sorting' | 'matching' | 'fill_blank' | 'free_response' | 'other';
interface Scene {
  timecode: string;
  visualDescription: string;
  voiceover: string;
  onScreenText: string;
  assetId?: string | null;
}

interface ScenarioOption {
  text: string;
  consequence: string;
  isBestChoice: boolean;
}

const SCREEN_TYPE_OPTIONS: { value: ScreenType; label: string }[] = [
  { value: 'title_intro', label: 'Title/Intro' },
  { value: 'content', label: 'Content' },
  { value: 'video', label: 'Video' },
  { value: 'practice', label: 'Practice' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'scenario', label: 'Scenario' },
];

const INTERACTION_TYPE_OPTIONS: { value: InteractionType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'click_reveal', label: 'Click to Reveal' },
  { value: 'drag_drop', label: 'Drag and Drop' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'branching', label: 'Branching/Decision' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'exercise', label: 'Exercise/Activity' },
  { value: 'video_playback', label: 'Video Playback' },
  { value: 'other', label: 'Other' },
];

const ACTIVITY_TYPE_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: 'drag_drop', label: 'Drag & Drop' },
  { value: 'click_reveal', label: 'Click to Reveal' },
  { value: 'sorting', label: 'Sorting' },
  { value: 'matching', label: 'Matching' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'free_response', label: 'Free Response' },
  { value: 'other', label: 'Other' },
];

// =============================================================================
// Auto-Expand Textarea Component
// =============================================================================

interface AutoExpandTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

function AutoExpandTextarea({ value, onChange, placeholder, className = '', minHeight = 60 }: AutoExpandTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(textarea.scrollHeight, minHeight) + 'px';
    }
  }, [minHeight]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        adjustHeight();
      }}
      placeholder={placeholder}
      className={`w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400 resize-none overflow-hidden ${className}`}
      style={{ minHeight: `${minHeight}px` }}
    />
  );
}

// =============================================================================
// Field Components by Screen Type
// =============================================================================

interface FieldProps {
  attrs: Record<string, unknown>;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  workspaceId: string;
}

// Title/Intro Fields
function TitleIntroFields({ attrs, updateAttributes, workspaceId }: FieldProps) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Title Card Text
        </label>
        <AutoExpandTextarea
          value={(attrs.titleCardText as string) || ''}
          onChange={(value) => updateAttributes({ titleCardText: value })}
          placeholder="Main text that appears on the title card..."
          minHeight={80}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Brief Voiceover
        </label>
        <AutoExpandTextarea
          value={(attrs.briefVoiceover as string) || ''}
          onChange={(value) => updateAttributes({ briefVoiceover: value })}
          placeholder="Short intro narration..."
          minHeight={60}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Background/Visual Notes
        </label>
        <AutoExpandTextarea
          value={(attrs.backgroundNotes as string) || ''}
          onChange={(value) => updateAttributes({ backgroundNotes: value })}
          placeholder="Describe background image, animation, or visual treatment..."
          minHeight={60}
        />
      </div>

      {workspaceId && (
        <AssetAttachment
          workspaceId={workspaceId}
          assetId={(attrs.backgroundAssetId as string) || null}
          onAttach={(assetId) => updateAttributes({ backgroundAssetId: assetId })}
          onRemove={() => updateAttributes({ backgroundAssetId: null })}
          label="Background image"
        />
      )}
    </div>
  );
}

// Content Fields (Default Layout)
function ContentFields({ attrs, updateAttributes, workspaceId }: FieldProps) {
  return (
    <>
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        {/* Left Column: Visuals */}
        <div className="p-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Visuals
          </label>
          <AutoExpandTextarea
            value={(attrs.visuals as string) || ''}
            onChange={(value) => updateAttributes({ visuals: value })}
            placeholder="Describe what appears on screen: graphics, animations, characters, backgrounds, UI elements..."
            minHeight={120}
          />
          {workspaceId && (
            <div className="mt-3">
              <AssetAttachment
                workspaceId={workspaceId}
                assetId={(attrs.visualsAssetId as string) || null}
                onAttach={(assetId) => updateAttributes({ visualsAssetId: assetId })}
                onRemove={() => updateAttributes({ visualsAssetId: null })}
                label="Reference screenshot"
              />
            </div>
          )}
        </div>

        {/* Right Column: On-Screen Text + Voiceover Script */}
        <div className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              On-Screen Text
            </label>
            <AutoExpandTextarea
              value={(attrs.onScreenText as string) || ''}
              onChange={(value) => updateAttributes({ onScreenText: value })}
              placeholder="Text that the learner reads on screen..."
              minHeight={60}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Voiceover Script
            </label>
            <AutoExpandTextarea
              value={(attrs.voiceoverScript as string) || ''}
              onChange={(value) => updateAttributes({ voiceoverScript: value })}
              placeholder="Narration script for audio recording..."
              minHeight={60}
            />
          </div>
        </div>
      </div>

      {/* Interaction Row */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Interaction
            </label>
            <select
              value={(attrs.interactionType as string) || 'none'}
              onChange={(e) => updateAttributes({ interactionType: e.target.value })}
              className="px-2 py-1.5 text-sm text-gray-700 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {INTERACTION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {attrs.interactionType !== 'none' && (
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Interaction Details
              </label>
              <input
                type="text"
                value={(attrs.interactionDetails as string) || ''}
                onChange={(e) => updateAttributes({ interactionDetails: e.target.value })}
                placeholder="Additional details about the interaction..."
                className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Video Fields
function VideoFields({ attrs, updateAttributes, workspaceId }: FieldProps) {
  const scenes = (attrs.scenes as Scene[]) || [];

  const addScene = () => {
    updateAttributes({
      scenes: [...scenes, { timecode: '', visualDescription: '', voiceover: '', onScreenText: '' }],
    });
  };

  const updateScene = (index: number, field: keyof Scene, value: string) => {
    const newScenes = [...scenes];
    newScenes[index] = { ...newScenes[index], [field]: value };
    updateAttributes({ scenes: newScenes });
  };

  const removeScene = (index: number) => {
    updateAttributes({ scenes: scenes.filter((_, i) => i !== index) });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Video Source
        </label>
        <input
          type="text"
          value={(attrs.videoSource as string) || ''}
          onChange={(e) => updateAttributes({ videoSource: e.target.value })}
          placeholder="URL or file reference..."
          className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Scene Sections
          </label>
          <button
            type="button"
            onClick={addScene}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Scene
          </button>
        </div>

        {scenes.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No scenes added yet. Click &quot;Add Scene&quot; to start.</p>
        ) : (
          <div className="space-y-3">
            {scenes.map((scene, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Scene {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeScene(index)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <input
                    type="text"
                    value={scene.timecode}
                    onChange={(e) => updateScene(index, 'timecode', e.target.value)}
                    placeholder="0:00 - 0:30"
                    className="px-2 py-1 text-xs text-gray-700 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <AutoExpandTextarea
                    value={scene.visualDescription}
                    onChange={(value) => updateScene(index, 'visualDescription', value)}
                    placeholder="Visual description..."
                    minHeight={40}
                  />
                  <AutoExpandTextarea
                    value={scene.voiceover}
                    onChange={(value) => updateScene(index, 'voiceover', value)}
                    placeholder="Voiceover/Script..."
                    minHeight={40}
                  />
                </div>
                <div className="mt-2">
                  <AutoExpandTextarea
                    value={scene.onScreenText}
                    onChange={(value) => updateScene(index, 'onScreenText', value)}
                    placeholder="On-screen text/captions..."
                    minHeight={30}
                  />
                </div>
                {workspaceId && (
                  <div className="mt-2">
                    <AssetAttachment
                      workspaceId={workspaceId}
                      assetId={scene.assetId || null}
                      onAttach={(assetId) => {
                        const updated = [...scenes];
                        updated[index] = { ...updated[index], assetId };
                        updateAttributes({ scenes: updated });
                      }}
                      onRemove={() => {
                        const updated = [...scenes];
                        updated[index] = { ...updated[index], assetId: null };
                        updateAttributes({ scenes: updated });
                      }}
                      label="Scene reference"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Practice Fields
function PracticeFields({ attrs, updateAttributes }: FieldProps) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Activity Type
        </label>
        <select
          value={(attrs.activityType as string) || 'other'}
          onChange={(e) => updateAttributes({ activityType: e.target.value })}
          className="px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
        >
          {ACTIVITY_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Activity Description
        </label>
        <AutoExpandTextarea
          value={(attrs.activityDescription as string) || ''}
          onChange={(value) => updateAttributes({ activityDescription: value })}
          placeholder="Describe what the learner does in this activity..."
          minHeight={60}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Instructions
        </label>
        <AutoExpandTextarea
          value={(attrs.instructions as string) || ''}
          onChange={(value) => updateAttributes({ instructions: value })}
          placeholder="Instructions shown to the learner..."
          minHeight={60}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Hints (Optional)
        </label>
        <AutoExpandTextarea
          value={(attrs.hints as string) || ''}
          onChange={(value) => updateAttributes({ hints: value })}
          placeholder="Help text if learner needs assistance..."
          minHeight={40}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
            Correct Feedback
          </label>
          <AutoExpandTextarea
            value={(attrs.correctFeedback as string) || ''}
            onChange={(value) => updateAttributes({ correctFeedback: value })}
            placeholder="Feedback when learner succeeds..."
            minHeight={50}
            className="border-green-200 bg-green-50 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
            Incorrect Feedback
          </label>
          <AutoExpandTextarea
            value={(attrs.incorrectFeedback as string) || ''}
            onChange={(value) => updateAttributes({ incorrectFeedback: value })}
            placeholder="Feedback when learner needs to try again..."
            minHeight={50}
            className="border-red-200 bg-red-50 focus:ring-red-500"
          />
        </div>
      </div>
    </div>
  );
}

// Assessment option constants
const ASSESSMENT_PURPOSE_OPTIONS = [
  { value: 'diagnostic', label: 'Diagnostic (Pre-Assessment)' },
  { value: 'formative_knowledge_check', label: 'Formative (Knowledge Check)' },
  { value: 'formative_practice', label: 'Formative (Practice Activity)' },
  { value: 'summative_quiz_exam', label: 'Summative (Quiz/Exam)' },
  { value: 'summative_performance', label: 'Summative (Performance Assessment)' },
];

const ASSESSMENT_FORMAT_OPTIONS = [
  { value: 'quiz', label: 'Quiz' },
  { value: 'exam', label: 'Exam' },
  { value: 'scenario_based', label: 'Scenario-Based' },
  { value: 'performance_observation', label: 'Performance/Observation' },
  { value: 'work_sample_collection', label: 'Work Sample Collection' },
  { value: 'reflection', label: 'Reflection' },
  { value: 'peer_review', label: 'Peer Review' },
  { value: 'other', label: 'Other' },
];

const COGNITIVE_DEMAND_OPTIONS = [
  { value: 'recognition', label: 'Recognition (identify/select)' },
  { value: 'recall', label: 'Recall (retrieve/state)' },
  { value: 'application', label: 'Application (use/demonstrate)' },
  { value: 'analysis_evaluation', label: 'Analysis/Evaluation (judge/decide)' },
];

const ASSESSMENT_RATIONALE_OPTIONS = [
  { value: 'retrieval_practice', label: 'Retrieval Practice — strengthen memory through active recall' },
  { value: 'spaced_practice', label: 'Spaced Practice — revisit earlier content at intervals' },
  { value: 'misconception_check', label: 'Misconception Check — surface and correct common errors' },
  { value: 'prerequisite_gate', label: 'Prerequisite Gate — verify readiness before advancing' },
  { value: 'mastery_verification', label: 'Mastery Verification — confirm objective achievement' },
  { value: 'confidence_calibration', label: 'Confidence Calibration — expose gap between perceived and actual knowledge' },
  { value: 'application_transfer', label: 'Application Transfer — test ability to use knowledge in realistic context' },
  { value: 'learner_self_assessment', label: 'Learner Self-Assessment — build metacognitive awareness' },
  { value: 'compliance_certification', label: 'Compliance/Certification — meet regulatory or policy requirement' },
  { value: 'engagement_momentum', label: 'Engagement/Momentum — re-engage attention mid-lesson' },
  { value: 'other', label: 'Other' },
];

const ATTEMPTS_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: 'unlimited', label: 'Unlimited' },
];

const GRADED_OPTIONS = [
  { value: 'graded', label: 'Graded' },
  { value: 'completion_only', label: 'Completion Only' },
  { value: 'ungraded_practice', label: 'Ungraded Practice' },
];

const FEEDBACK_STRATEGY_OPTIONS = [
  { value: 'immediate_corrective', label: 'Immediate Corrective' },
  { value: 'immediate_elaborative', label: 'Immediate Elaborative' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'no_feedback', label: 'No Feedback (Exam Conditions)' },
];

// Dynamic scope field label/placeholder based on format
function getDynamicScopeConfig(format: string): { label: string; placeholder: string } {
  switch (format) {
    case 'quiz':
    case 'exam':
      return { label: 'Estimated Questions', placeholder: 'e.g. 10' };
    case 'scenario_based':
      return { label: 'Decision Points', placeholder: 'e.g. 3' };
    case 'performance_observation':
      return { label: 'Tasks Observed', placeholder: 'e.g. 5' };
    case 'work_sample_collection':
      return { label: 'Artifacts Required', placeholder: 'e.g. 3' };
    case 'reflection':
    case 'peer_review':
      return { label: 'Number of Items', placeholder: 'e.g. 8' };
    case 'other':
      return { label: 'Scope Notes', placeholder: 'Describe scope...' };
    default:
      return { label: 'Scope', placeholder: '' };
  }
}

function AssessmentFields({ attrs, updateAttributes }: FieldProps) {
  const assessmentFormat = (attrs.assessmentFormat as string) || '';
  const rationale = Array.isArray(attrs.assessmentRationale) ? attrs.assessmentRationale as string[] : [];
  const dynamicScope = getDynamicScopeConfig(assessmentFormat);

  const toggleRationale = (value: string) => {
    const current = [...rationale];
    const index = current.indexOf(value);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    updateAttributes({ assessmentRationale: current });
  };

  return (
    <div className="p-4 space-y-5">
      {/* Row 1: Purpose + Format */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Assessment Purpose
          </label>
          <select
            value={(attrs.assessmentPurpose as string) || ''}
            onChange={(e) => updateAttributes({ assessmentPurpose: e.target.value })}
            className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
          >
            <option value="">Select purpose...</option>
            {ASSESSMENT_PURPOSE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Assessment Format
          </label>
          <select
            value={assessmentFormat}
            onChange={(e) => updateAttributes({ assessmentFormat: e.target.value, dynamicScopeValue: '' })}
            className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
          >
            <option value="">Select format...</option>
            {ASSESSMENT_FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {assessmentFormat === 'other' && (
            <input
              type="text"
              value={(attrs.assessmentFormatOther as string) || ''}
              onChange={(e) => updateAttributes({ assessmentFormatOther: e.target.value })}
              placeholder="Describe format..."
              className="w-full mt-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
            />
          )}
        </div>
      </div>

      {/* Row 2: Cognitive Demand + Feedback Strategy */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Cognitive Demand
          </label>
          <select
            value={(attrs.cognitiveDemand as string) || ''}
            onChange={(e) => updateAttributes({ cognitiveDemand: e.target.value })}
            className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
          >
            <option value="">Select level...</option>
            {COGNITIVE_DEMAND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Feedback Strategy
          </label>
          <select
            value={(attrs.feedbackStrategy as string) || ''}
            onChange={(e) => updateAttributes({ feedbackStrategy: e.target.value })}
            className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
          >
            <option value="">Select strategy...</option>
            {FEEDBACK_STRATEGY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Scope — Universal fields + dynamic field */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Assessment Scope
        </label>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Est. Duration</label>
            <input
              type="text"
              value={(attrs.estimatedDuration as string) || ''}
              onChange={(e) => updateAttributes({ estimatedDuration: e.target.value })}
              placeholder="e.g. 15 min"
              className="w-full px-2 py-1.5 text-sm text-gray-700 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Attempts</label>
            <select
              value={(attrs.attemptsAllowed as string) || '1'}
              onChange={(e) => updateAttributes({ attemptsAllowed: e.target.value })}
              className="w-full px-2 py-1.5 text-sm text-gray-700 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
            >
              {ATTEMPTS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Grading</label>
            <select
              value={(attrs.gradedWeighted as string) || ''}
              onChange={(e) => updateAttributes({ gradedWeighted: e.target.value })}
              className="w-full px-2 py-1.5 text-sm text-gray-700 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
            >
              <option value="">Select...</option>
              {GRADED_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {assessmentFormat && (
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">{dynamicScope.label}</label>
              {assessmentFormat === 'other' ? (
                <input
                  type="text"
                  value={(attrs.dynamicScopeValue as string) || ''}
                  onChange={(e) => updateAttributes({ dynamicScopeValue: e.target.value })}
                  placeholder={dynamicScope.placeholder}
                  className="w-full px-2 py-1.5 text-sm text-gray-700 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
                />
              ) : (
                <input
                  type="number"
                  min="1"
                  value={(attrs.dynamicScopeValue as string) || ''}
                  onChange={(e) => updateAttributes({ dynamicScopeValue: e.target.value })}
                  placeholder={dynamicScope.placeholder}
                  className="w-full px-2 py-1.5 text-sm text-gray-700 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Passing Criteria */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Passing Criteria
        </label>
        <input
          type="text"
          value={(attrs.passingCriteria as string) || ''}
          onChange={(e) => updateAttributes({ passingCriteria: e.target.value })}
          placeholder="e.g. 80%, All safety items correct, Complete all scenarios"
          className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
        />
      </div>

      {/* Assessment Rationale — Multi-select checkboxes */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Assessment Rationale
          <span className="ml-2 font-normal normal-case tracking-normal text-gray-400">— Why does this assessment point exist here?</span>
        </label>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-gray-50 border border-gray-200 rounded-md p-3">
          {ASSESSMENT_RATIONALE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-start gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rationale.includes(opt.value)}
                onChange={() => toggleRationale(opt.value)}
                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-xs text-gray-600 group-hover:text-gray-800 leading-snug">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
        {rationale.includes('other') && (
          <input
            type="text"
            value={(attrs.assessmentRationaleOther as string) || ''}
            onChange={(e) => updateAttributes({ assessmentRationaleOther: e.target.value })}
            placeholder="Describe other rationale..."
            className="w-full mt-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-400"
          />
        )}
      </div>

      {/* Linked Objectives placeholder */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Linked Objectives
        </label>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-700">
          Objective linking will connect to project objectives (similar to Learning Objectives Import). For now, use Designer Notes to reference which objectives this assessment covers.
        </div>
      </div>
    </div>
  );
}

// Scenario Fields
function ScenarioFields({ attrs, updateAttributes }: FieldProps) {
  const scenarioOptions = (attrs.scenarioOptions as ScenarioOption[]) || [];

  const addOption = () => {
    updateAttributes({
      scenarioOptions: [...scenarioOptions, { text: '', consequence: '', isBestChoice: false }],
    });
  };

  const updateOption = (index: number, field: keyof ScenarioOption, value: string | boolean) => {
    const newOptions = [...scenarioOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    updateAttributes({ scenarioOptions: newOptions });
  };

  const removeOption = (index: number) => {
    updateAttributes({ scenarioOptions: scenarioOptions.filter((_, i) => i !== index) });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Scenario Setup
        </label>
        <AutoExpandTextarea
          value={(attrs.scenarioSetup as string) || ''}
          onChange={(value) => updateAttributes({ scenarioSetup: value })}
          placeholder="Describe the context and situation..."
          minHeight={80}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Decision Prompt
        </label>
        <AutoExpandTextarea
          value={(attrs.decisionPrompt as string) || ''}
          onChange={(value) => updateAttributes({ decisionPrompt: value })}
          placeholder="What question or decision is the learner faced with?"
          minHeight={60}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Response Options
          </label>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Option
          </button>
        </div>

        {scenarioOptions.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No options added yet.</p>
        ) : (
          <div className="space-y-3">
            {scenarioOptions.map((option, index) => (
              <div key={index} className={`border rounded-lg p-3 ${option.isBestChoice ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={option.isBestChoice}
                      onChange={(e) => updateOption(index, 'isBestChoice', e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-xs font-medium text-gray-600">
                      {option.isBestChoice ? 'Best Choice' : `Option ${index + 1}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(index, 'text', e.target.value)}
                  placeholder="Option text..."
                  className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 mb-2"
                />
                <AutoExpandTextarea
                  value={option.consequence}
                  onChange={(value) => updateOption(index, 'consequence', value)}
                  placeholder="What happens if this option is chosen..."
                  minHeight={40}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Debrief
        </label>
        <AutoExpandTextarea
          value={(attrs.debrief as string) || ''}
          onChange={(value) => updateAttributes({ debrief: value })}
          placeholder="Explanation shown after the learner makes their choice..."
          minHeight={60}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function ContentScreenComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const attrs = node.attrs;
  const screenType = (attrs.screenType as ScreenType) || 'content';
  const [notesExpanded, setNotesExpanded] = useState(false);

  // Extract workspaceId from the URL path
  const workspaceId = typeof window !== 'undefined'
    ? window.location.pathname.split('/workspace/')[1]?.split('/')[0] ?? ''
    : '';

  const renderBody = () => {
    switch (screenType) {
      case 'title_intro':
        return <TitleIntroFields attrs={attrs} updateAttributes={updateAttributes} workspaceId={workspaceId} />;
      case 'video':
        return <VideoFields attrs={attrs} updateAttributes={updateAttributes} workspaceId={workspaceId} />;
      case 'practice':
        return <PracticeFields attrs={attrs} updateAttributes={updateAttributes} workspaceId={workspaceId} />;
      case 'assessment':
        return <AssessmentFields attrs={attrs} updateAttributes={updateAttributes} workspaceId={workspaceId} />;
      case 'scenario':
        return <ScenarioFields attrs={attrs} updateAttributes={updateAttributes} workspaceId={workspaceId} />;
      case 'content':
      default:
        return <ContentFields attrs={attrs} updateAttributes={updateAttributes} workspaceId={workspaceId} />;
    }
  };

  return (
    <NodeViewWrapper className="content-screen-wrapper">
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm mb-4 relative group">
        {/* Delete Button */}
        <button
          type="button"
          onClick={deleteNode}
          title="Delete block"
          className="absolute top-2 right-2 p-1.5 rounded-md z-10 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Header Row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg pr-12">
          <Monitor className="w-5 h-5 text-gray-500 flex-shrink-0" />

          {/* Screen Type Dropdown */}
          <div className="flex-shrink-0">
            <select
              value={screenType}
              onChange={(e) => updateAttributes({ screenType: e.target.value })}
              className="px-2 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SCREEN_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Screen ID */}
          <div className="flex-shrink-0">
            <input
              type="text"
              value={(attrs.screenId as string) || ''}
              onChange={(e) => updateAttributes({ screenId: e.target.value })}
              placeholder="SCR-001"
              className="w-20 px-2 py-1 text-xs font-mono font-medium text-gray-700 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />
          </div>

          {/* Screen Title */}
          <div className="flex-1">
            <input
              type="text"
              value={(attrs.screenTitle as string) || ''}
              onChange={(e) => updateAttributes({ screenTitle: e.target.value })}
              placeholder="Screen Title..."
              className="w-full px-3 py-1.5 text-sm font-medium text-gray-800 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />
          </div>

          {/* Duration */}
          <div className="flex-shrink-0">
            <input
              type="text"
              value={(attrs.duration as string) || ''}
              onChange={(e) => updateAttributes({ duration: e.target.value })}
              placeholder="30 sec"
              className="w-20 px-2 py-1 text-xs text-gray-600 text-center border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />
          </div>
        </div>

        {/* Dynamic Body based on Screen Type */}
        {renderBody()}

        {/* Notes Section (Collapsible) - All Types */}
        <div className="border-t border-gray-200">
          <button
            type="button"
            onClick={() => setNotesExpanded(!notesExpanded)}
            className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            {notesExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>Designer & Developer Notes</span>
            {((attrs.designerNotes as string) || (attrs.developerNotes as string)) && !notesExpanded && (
              <span className="ml-2 text-gray-400 truncate max-w-xs">
                {((attrs.designerNotes as string) || (attrs.developerNotes as string)).substring(0, 40)}...
              </span>
            )}
          </button>

          {notesExpanded && (
            <div className="px-4 pb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Designer Notes
                </label>
                <AutoExpandTextarea
                  value={(attrs.designerNotes as string) || ''}
                  onChange={(value) => updateAttributes({ designerNotes: value })}
                  placeholder="ID thoughts, SME questions, design rationale..."
                  minHeight={60}
                  className="border-yellow-200 bg-yellow-50 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Developer Notes
                </label>
                <AutoExpandTextarea
                  value={(attrs.developerNotes as string) || ''}
                  onChange={(value) => updateAttributes({ developerNotes: value })}
                  placeholder="Technical instructions, asset requirements, implementation notes..."
                  minHeight={60}
                  className="border-blue-200 bg-blue-50 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
