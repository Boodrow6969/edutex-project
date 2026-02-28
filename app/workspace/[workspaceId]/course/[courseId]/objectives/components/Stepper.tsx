'use client';

import { STEPS, STEP_ICONS } from '../constants';
import type { StepKey, StepStatus } from '../types';

interface StepperProps {
  step: StepKey;
  onChange: (step: StepKey) => void;
  status: Record<StepKey, StepStatus>;
}

export default function Stepper({ step, onChange, status }: StepperProps) {
  return (
    <div className="flex items-center gap-0 px-5 bg-white border-b border-gray-200 flex-shrink-0 overflow-auto">
      {STEPS.map((s, i) => {
        const active = step === s.key;
        const st = status[s.key] || 'none';
        return (
          <div key={s.key} className="flex items-center">
            <button
              onClick={() => onChange(s.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 border-none bg-transparent cursor-pointer -mb-px ${
                active ? 'border-b-2 border-[#03428e]' : 'border-b-2 border-transparent'
              }`}
            >
              <span className={`text-[11px] ${
                active ? 'text-[#03428e]' : st === 'done' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {STEP_ICONS[st]}
              </span>
              <span className={`text-xs whitespace-nowrap ${
                active ? 'font-semibold text-[#03428e]' : 'font-normal text-gray-900'
              }`}>
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <span className="text-gray-200 text-[11px] px-0.5">&rsaquo;</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
