'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { STEPS } from './constants';
import { newObjective } from './constants';
import type {
  StepKey,
  StepStatus,
  WizardObjective,
  TriageItemData,
  SubTaskData,
  NASummary,
  NASection,
} from './types';
import Stepper from './components/Stepper';
import NASlideOver from './components/NASlideOver';
import Screen1Context from './components/Screen1Context';
import Screen2Priority from './components/Screen2Priority';
import Screen3Tasks from './components/Screen3Tasks';
import Screen4Builder from './components/Screen4Builder';
import Screen5Validation from './components/Screen5Validation';
import Screen6Export from './components/Screen6Export';

/** Converts wizard-format fields to DB-format fields for the API */
function convertWizardFieldsToDb(fields: Partial<WizardObjective>): Record<string, unknown> {
  const db: Record<string, unknown> = {};

  // behavior → title
  if (fields.behavior !== undefined) db.title = fields.behavior;

  // linkedTaskId → linkedTriageItemId
  if (fields.linkedTaskId !== undefined) db.linkedTriageItemId = fields.linkedTaskId;

  // Priority: 'Must Have' → 'MUST', etc.
  if (fields.priority !== undefined) {
    const priMap: Record<string, string> = {
      'Must Have': 'MUST',
      'Should Have': 'SHOULD',
      'Nice to Have': 'NICE_TO_HAVE',
    };
    db.objectivePriority = priMap[fields.priority] || null;
  }

  // Bloom level: 'Remember' → 'REMEMBER', etc.
  if (fields.bloomLevel !== undefined) {
    db.bloomLevel = fields.bloomLevel ? fields.bloomLevel.toUpperCase() : null;
  }

  // Bloom knowledge: 'Factual' → 'FACTUAL', etc.
  if (fields.bloomKnowledge !== undefined) {
    db.bloomKnowledge = fields.bloomKnowledge ? fields.bloomKnowledge.toUpperCase() : null;
  }

  // Pass-through fields (same name in wizard and DB)
  const passthrough: (keyof WizardObjective)[] = [
    'audience', 'verb', 'condition', 'criteria',
    'freeformText', 'requiresAssessment', 'rationale',
    'wiifm', 'sortOrder',
  ];
  for (const key of passthrough) {
    if (fields[key] !== undefined) db[key] = fields[key];
  }

  return db;
}

interface ObjectivesWizardProps {
  courseId: string;
  courseName: string;
  initialObjectives: WizardObjective[];
  initialTriageItems: TriageItemData[];
  initialSubTasks: SubTaskData[];
  initialGap: { knowledge: boolean; skill: boolean };
  naSummary: NASummary | null;
  naSections: NASection[];
  audiences: string[];
}

export default function ObjectivesWizard({
  courseId,
  courseName,
  initialObjectives,
  initialTriageItems,
  initialSubTasks,
  initialGap,
  naSummary,
  naSections,
  audiences,
}: ObjectivesWizardProps) {
  const [step, setStep] = useState<StepKey>('context');
  const [gapTypes, setGapTypes] = useState(initialGap);
  const [triageItems, setTriageItems] = useState<TriageItemData[]>(initialTriageItems);
  const [subTasks, setSubTasks] = useState<SubTaskData[]>(initialSubTasks);
  const [objs, setObjs] = useState<WizardObjective[]>(initialObjectives);
  const [selId, setSelId] = useState<string | null>(initialObjectives[0]?.id || null);
  const [soOpen, setSoOpen] = useState(false);
  const [soTab, setSoTab] = useState('tasks');
  const [showAI, setShowAI] = useState(false);

  const openNA = useCallback((tab: string) => {
    setSoTab(tab || 'tasks');
    setSoOpen(true);
  }, []);

  // ─── Autosave: gap classification ───
  const gapSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isGapInitial = useRef(true);
  useEffect(() => {
    if (isGapInitial.current) {
      isGapInitial.current = false;
      return;
    }
    clearTimeout(gapSaveTimer.current);
    gapSaveTimer.current = setTimeout(async () => {
      try {
        await fetch(`/api/courses/${courseId}/gap`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gapKnowledge: gapTypes.knowledge,
            gapSkill: gapTypes.skill,
          }),
        });
      } catch {
        // Silent fail — gap is advisory
      }
    }, 1500);
    return () => clearTimeout(gapSaveTimer.current);
  }, [gapTypes, courseId]);

  // ─── Autosave: objectives ───
  const objPendingRef = useRef<Map<string, Record<string, unknown>>>(new Map());
  const objTimerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const objCreatingRef = useRef<Set<string>>(new Set()); // temp IDs with POST in flight

  const flushObjSave = useCallback(async (objId: string) => {
    const pending = objPendingRef.current.get(objId);
    if (!pending || Object.keys(pending).length === 0) return;
    objPendingRef.current.delete(objId);
    // Skip temp IDs — they'll be flushed after POST completes
    if (objCreatingRef.current.has(objId)) return;
    try {
      await fetch(`/api/objectives/${objId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pending),
      });
    } catch {
      // Silent fail — user can retry
    }
  }, []);

  const handleObjFieldChange = useCallback((objId: string, updates: Partial<WizardObjective>) => {
    // Accumulate dirty fields (converted to DB format)
    const dbUpdates = convertWizardFieldsToDb(updates);
    const existing = objPendingRef.current.get(objId) || {};
    objPendingRef.current.set(objId, { ...existing, ...dbUpdates });
    // Reset debounce timer for this objective
    const existingTimer = objTimerRef.current.get(objId);
    if (existingTimer) clearTimeout(existingTimer);
    objTimerRef.current.set(
      objId,
      setTimeout(() => {
        objTimerRef.current.delete(objId);
        flushObjSave(objId);
      }, 1500)
    );
  }, [flushObjSave]);

  const handleAddObj = useCallback(async () => {
    const n = newObjective();
    const tempId = n.id;
    setObjs((p) => [...p, n]);
    setSelId(tempId);
    // POST to API
    objCreatingRef.current.add(tempId);
    try {
      const res = await fetch(`/api/courses/${courseId}/objectives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '', objectivePriority: 'SHOULD' }),
      });
      if (!res.ok) throw new Error('Failed to create objective');
      const created = await res.json();
      const realId = created.id;
      objCreatingRef.current.delete(tempId);
      // Swap temp ID with real ID in state
      setObjs((p) => p.map((o) => (o.id === tempId ? { ...o, id: realId } : o)));
      setSelId((prev) => (prev === tempId ? realId : prev));
      // Flush any changes accumulated during POST
      const queued = objPendingRef.current.get(tempId);
      if (queued && Object.keys(queued).length > 0) {
        objPendingRef.current.delete(tempId);
        objPendingRef.current.set(realId, queued);
        flushObjSave(realId);
      }
    } catch {
      objCreatingRef.current.delete(tempId);
      setObjs((p) => p.filter((o) => o.id !== tempId));
    }
  }, [courseId, flushObjSave]);

  const handleDeleteObj = useCallback(async (objId: string) => {
    // Remove from state immediately
    setObjs((p) => p.filter((o) => o.id !== objId));
    setSelId((prev) => {
      if (prev !== objId) return prev;
      // Select another objective
      return null;
    });
    // Clear pending saves
    objPendingRef.current.delete(objId);
    const timer = objTimerRef.current.get(objId);
    if (timer) { clearTimeout(timer); objTimerRef.current.delete(objId); }
    // Skip API if temp ID
    if (objCreatingRef.current.has(objId)) {
      objCreatingRef.current.delete(objId);
      return;
    }
    try {
      await fetch(`/api/objectives/${objId}`, { method: 'DELETE' });
    } catch {
      // Silent fail
    }
  }, []);

  // Cleanup objective timers on unmount
  useEffect(() => {
    return () => {
      objTimerRef.current.forEach((timer) => clearTimeout(timer));
      // Attempt to flush any pending saves synchronously
      objPendingRef.current.forEach((_pending, objId) => {
        flushObjSave(objId);
      });
    };
  }, [flushObjSave]);

  // ─── Create objective from Export screen ───
  const createObjFromExport = useCallback(() => {
    handleAddObj();
    setStep('builder');
  }, [handleAddObj]);

  // ─── Step status computation ───
  const status = useMemo<Record<StepKey, StepStatus>>(() => {
    return {
      context: gapTypes.knowledge || gapTypes.skill ? 'done' : 'none',
      priority: triageItems.some((i) => i.column !== 'nice') ? 'done' : 'none',
      tasks: subTasks.length > 0 ? 'progress' : 'none',
      builder: objs.length > 0 ? 'progress' : 'none',
      validation: objs.length > 0 ? 'progress' : 'none',
      export: 'none',
    };
  }, [gapTypes, triageItems, subTasks, objs]);

  // ─── Navigation ───
  const nextStep = () => {
    const i = STEPS.findIndex((s) => s.key === step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1].key);
  };
  const prevStep = () => {
    const i = STEPS.findIndex((s) => s.key === step);
    if (i > 0) setStep(STEPS[i - 1].key);
  };
  const skipToBuilder = () => setStep('builder');

  return (
    <div className="h-full flex flex-col bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 bg-[#03428e] rounded-sm" />
          <span className="text-[15px] font-bold text-gray-900">Learning Objectives</span>
          <span className="text-[11px] text-gray-500">{courseName}</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => openNA('tasks')}
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#03428e] bg-[#e8eef7] border border-[#03428e]/20 rounded cursor-pointer hover:bg-[#dbe4f3]"
          >
            <span className="text-[13px]">📋</span> Needs Analysis Data
          </button>
        </div>
      </div>

      {/* Stepper */}
      <Stepper step={step} onChange={setStep} status={status} />

      {/* Nav bar */}
      <div className="flex items-center justify-end px-5 py-1.5 bg-white border-b border-gray-200 gap-1.5 flex-shrink-0">
        {step !== 'context' && (
          <button
            onClick={prevStep}
            className="px-3 py-1 text-[11px] text-gray-500 bg-white border border-gray-200 rounded cursor-pointer hover:bg-gray-50"
          >
            ← Back
          </button>
        )}
        {step !== 'export' && (
          <button
            onClick={nextStep}
            className="px-3 py-1 text-[11px] font-semibold text-white bg-[#03428e] border-none rounded cursor-pointer hover:bg-[#022d61]"
          >
            Continue →
          </button>
        )}
        {step !== 'builder' && step !== 'validation' && step !== 'export' && (
          <button
            onClick={skipToBuilder}
            className="px-3 py-1 text-[11px] text-gray-500 bg-transparent border-none cursor-pointer underline"
          >
            skip to builder
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {step === 'context' && (
          <Screen1Context
            gapTypes={gapTypes}
            setGapTypes={setGapTypes}
            naSummary={naSummary}
          />
        )}
        {step === 'priority' && (
          <Screen2Priority
            triageItems={triageItems}
            setTriageItems={setTriageItems}
            courseId={courseId}
          />
        )}
        {step === 'tasks' && (
          <Screen3Tasks
            triageItems={triageItems}
            subTasks={subTasks}
            setSubTasks={setSubTasks}
            openNA={openNA}
            courseId={courseId}
          />
        )}
        {step === 'builder' && (
          <Screen4Builder
            objs={objs}
            setObjs={setObjs}
            selId={selId}
            setSelId={setSelId}
            triageItems={triageItems}
            gapTypes={gapTypes}
            audiences={audiences}
            openNA={openNA}
            showAI={showAI}
            setShowAI={setShowAI}
            onFieldChange={handleObjFieldChange}
            onAddObj={handleAddObj}
            onDeleteObj={handleDeleteObj}
          />
        )}
        {step === 'validation' && (
          <Screen5Validation
            objs={objs}
            triageItems={triageItems}
            naSummary={naSummary}
          />
        )}
        {step === 'export' && (
          <Screen6Export
            objs={objs}
            triageItems={triageItems}
            audiences={audiences}
            onCreateObjective={createObjFromExport}
          />
        )}
      </div>

      {/* NA Slide-over */}
      <NASlideOver
        isOpen={soOpen}
        onClose={() => setSoOpen(false)}
        defaultTab={soTab}
        sections={naSections}
      />
    </div>
  );
}
