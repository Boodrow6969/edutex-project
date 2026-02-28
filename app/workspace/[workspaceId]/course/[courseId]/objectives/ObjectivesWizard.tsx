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

  // ─── Create objective from Export screen ───
  const createObjFromExport = useCallback(() => {
    const n = newObjective();
    setObjs((p) => [...p, n]);
    setSelId(n.id);
    setStep('builder');
  }, []);

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
