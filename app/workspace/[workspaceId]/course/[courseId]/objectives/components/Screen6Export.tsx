'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { BloomBadge, PriorityBadge } from './ObjCard';
import type { WizardObjective, TriageItemData } from '../types';

interface Screen6Props {
  objs: WizardObjective[];
  triageItems: TriageItemData[];
  audiences: string[];
  courseId: string;
  courseName: string;
  onCreateObjective: () => void;
}

export default function Screen6Export({
  objs,
  triageItems,
  audiences,
  courseId,
  courseName,
  onCreateObjective,
}: Screen6Props) {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [exporting, setExporting] = useState<'docx' | 'pdf' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [pushing, setPushing] = useState<'storyboard' | 'assessment' | null>(null);
  const [pushResult, setPushResult] = useState<{
    type: 'success' | 'error';
    message: string;
    storyboardPageId?: string;
  } | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [copying, setCopying] = useState<'designStrategy' | null>(null);
  const [copyResult, setCopyResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const activeTasks = triageItems.filter((t) => t.column !== 'nice');
  const orphanTasks = activeTasks.filter(
    (t) => !objs.some((o) => o.linkedTaskId === t.id)
  );

  // Group objectives by parent task
  const grouped: Record<string, WizardObjective[]> = {};
  objs.forEach((o) => {
    const taskName = o.linkedTaskId
      ? triageItems.find((t) => t.id === o.linkedTaskId)?.text || 'Unknown Task'
      : 'Ungrouped';
    if (!grouped[taskName]) grouped[taskName] = [];
    grouped[taskName].push(o);
  });

  const handleExport = async (format: 'docx' | 'pdf') => {
    try {
      setExporting(format);
      setExportError(null);
      const response = await fetch(
        `/api/courses/${courseId}/objectives/export?format=${format}`
      );

      // Handle PDF fallback
      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (data.fallback === 'docx') {
            setExportError(data.error);
            return;
          }
        }
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = format === 'pdf' ? 'pdf' : 'docx';
      const safeName = courseName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
      a.download = `Learning_Objectives_${safeName}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setExportError('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const handlePushToStoryboard = async () => {
    try {
      setPushing('storyboard');
      setPushResult(null);
      const response = await fetch(
        `/api/courses/${courseId}/objectives/push-to-storyboard`,
        { method: 'POST' }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Push failed');
      }
      const result = await response.json();
      setPushResult({
        type: 'success',
        message:
          `${result.created} objective${result.created !== 1 ? 's' : ''} pushed to storyboard.` +
          (result.skipped > 0 ? ` ${result.skipped} already present.` : ''),
        storyboardPageId: result.storyboardPageId,
      });
    } catch (err) {
      console.error('Push to storyboard error:', err);
      setPushResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Push failed',
      });
    } finally {
      setPushing(null);
    }
  };

  const handlePushToAssessment = async () => {
    try {
      setPushing('assessment');
      setAssessmentResult(null);
      const response = await fetch(
        `/api/courses/${courseId}/objectives/push-to-assessment`,
        { method: 'POST' }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Push failed');
      }
      setAssessmentResult({
        type: 'success',
        message: result.message,
      });
    } catch (err) {
      console.error('Push to assessment error:', err);
      setAssessmentResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Push failed',
      });
    } finally {
      setPushing(null);
    }
  };

  const anyInFlight = exporting !== null || pushing !== null || copying !== null;

  const handleCopyToDesignStrategy = async () => {
    try {
      setCopying('designStrategy');
      setCopyResult(null);
      const response = await fetch(
        `/api/courses/${courseId}/objectives/copy-to-design-strategy`,
        { method: 'POST' }
      );
      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const err = await response.json();
          throw new Error(err.error || 'Export failed');
        }
        throw new Error('Export failed');
      }
      // Check if JSON response (no objectives case)
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const result = await response.json();
        setCopyResult({
          type: 'success',
          message: result.message,
        });
        return;
      }
      // Response is a .docx file — download it
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const safeName = courseName.replace(/[^a-zA-Z0-9]/g, '_');
      const a = document.createElement('a');
      a.href = url;
      a.download = `Design_Strategy_${safeName}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setCopyResult({
        type: 'success',
        message: 'Design Strategy document generated and saved to course.',
      });
    } catch (err) {
      console.error('Copy to Design Strategy error:', err);
      setCopyResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Export failed',
      });
    } finally {
      setCopying(null);
    }
  };

  const actions = [
    {
      icon: '📝',
      label: 'Push to Storyboard',
      desc: 'Each objective seeds a module block in the storyboard editor',
    },
    {
      icon: '📋',
      label: 'Push to Assessment Builder',
      desc: `${objs.filter((o) => o.requiresAssessment).length} assessed objectives create assessment stubs`,
    },
    {
      icon: '📎',
      label: 'Copy to Design Strategy',
      desc: 'Generate a Design Strategy document pre-filled with objectives and lesson stubs',
    },
  ];

  const composeText = (o: WizardObjective) => {
    if (o.freeformText) return o.freeformText;
    const parts: string[] = [];
    if (o.condition) parts.push(o.condition + ', ');
    parts.push((o.audience || audiences[0] || '') + ' will ');
    parts.push(o.behavior || '[behavior]');
    if (o.criteria) parts.push(', ' + o.criteria);
    return parts.join('');
  };

  return (
    <div className="p-5 max-w-[820px] mx-auto">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Export & Downstream Handoff</h2>
      <p className="text-[13px] text-gray-500 mb-4">
        Export always works regardless of completeness. Missing fields are blank, not blocked.
      </p>

      {/* Export buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
        <button
          onClick={() => handleExport('docx')}
          disabled={anyInFlight}
          className="flex items-start gap-2.5 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg flex-shrink-0">📄</span>
          <div>
            <div className="text-[13px] font-semibold text-gray-900">
              {exporting === 'docx' ? 'Exporting...' : 'Export to Word'}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Download .docx for stakeholder review
            </div>
          </div>
        </button>
        <button
          onClick={() => handleExport('pdf')}
          disabled={anyInFlight}
          className="flex items-start gap-2.5 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg flex-shrink-0">📑</span>
          <div>
            <div className="text-[13px] font-semibold text-gray-900">
              {exporting === 'pdf' ? 'Exporting...' : 'Export to PDF'}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Download .pdf for stakeholder review
            </div>
          </div>
        </button>
      </div>

      {/* Export error message */}
      {exportError && (
        <div className="mb-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[12px] text-amber-700">
          {exportError}
        </div>
      )}

      {/* Push action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
        {/* Push to Storyboard */}
        <button
          onClick={handlePushToStoryboard}
          disabled={anyInFlight}
          className="flex items-start gap-2.5 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg flex-shrink-0">{actions[0].icon}</span>
          <div>
            <div className="text-[13px] font-semibold text-gray-900">
              {pushing === 'storyboard' ? 'Pushing...' : actions[0].label}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">{actions[0].desc}</div>
          </div>
        </button>
        {/* Push to Assessment Builder */}
        <button
          onClick={handlePushToAssessment}
          disabled={anyInFlight}
          className="flex items-start gap-2.5 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg flex-shrink-0">{actions[1].icon}</span>
          <div>
            <div className="text-[13px] font-semibold text-gray-900">
              {pushing === 'assessment' ? 'Pushing...' : actions[1].label}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">{actions[1].desc}</div>
          </div>
        </button>
        {/* Copy to Design Strategy */}
        <button
          onClick={handleCopyToDesignStrategy}
          disabled={anyInFlight}
          className="flex items-start gap-2.5 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg flex-shrink-0">{actions[2].icon}</span>
          <div>
            <div className="text-[13px] font-semibold text-gray-900">
              {copying === 'designStrategy' ? 'Generating...' : actions[2].label}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">{actions[2].desc}</div>
          </div>
        </button>
      </div>

      {/* Push to Storyboard result banner */}
      {pushResult && (
        <div
          className={`mb-3 px-4 py-2.5 border rounded-lg text-[12px] ${
            pushResult.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {pushResult.message}
          {pushResult.type === 'success' && pushResult.storyboardPageId && (
            <a
              href={`/workspace/${workspaceId}/course/${courseId}/storyboard`}
              className="ml-2 font-semibold underline"
            >
              View Storyboard &rarr;
            </a>
          )}
        </div>
      )}

      {/* Push to Assessment result banner */}
      {assessmentResult && (
        <div
          className={`mb-3 px-4 py-2.5 border rounded-lg text-[12px] ${
            assessmentResult.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {assessmentResult.message}
        </div>
      )}

      {/* Copy to Design Strategy result banner */}
      {copyResult && (
        <div
          className={`mb-3 px-4 py-2.5 border rounded-lg text-[12px] ${
            copyResult.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {copyResult.message}
        </div>
      )}

      {/* Orphan task warning */}
      {orphanTasks.length > 0 && (
        <div className="mb-4 px-4.5 py-3.5 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">⚠️</span>
            <span className="text-[13px] font-bold text-amber-600">
              {orphanTasks.length} parent task{orphanTasks.length !== 1 ? 's' : ''} from Needs
              Analysis have no matching objectives:
            </span>
          </div>
          {orphanTasks.map((t) => (
            <div key={t.id} className="text-xs text-amber-800 py-px pl-6.5">
              &bull; {t.text}
            </div>
          ))}
          <div className="mt-2.5 pl-6.5">
            <button
              onClick={onCreateObjective}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#03428e] border-none rounded cursor-pointer hover:bg-[#022d61]"
            >
              Create Objectives
            </button>
          </div>
        </div>
      )}

      {/* All Objectives grouped list */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="text-sm font-bold text-gray-900 mb-3.5">
          All Objectives ({objs.length})
        </div>
        {Object.entries(grouped).map(([taskName, items]) => (
          <div key={taskName} className="mb-4">
            <div className="text-xs font-bold text-[#03428e] uppercase tracking-wide mb-1.5 pb-1 border-b border-gray-200">
              Parent Task: {taskName}
            </div>
            {items.map((o) => {
              const txt = composeText(o);
              return (
                <div key={o.id} className="py-2 border-b border-gray-200/15">
                  <div className="text-[13px] text-gray-900 leading-normal">{txt}</div>
                  <div className="flex gap-1.5 mt-1">
                    {o.bloomLevel && <BloomBadge level={o.bloomLevel} />}
                    {o.priority && <PriorityBadge priority={o.priority} />}
                    {o.requiresAssessment && (
                      <span className="text-[10px] text-cyan-600 font-medium">📋 Assess</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
