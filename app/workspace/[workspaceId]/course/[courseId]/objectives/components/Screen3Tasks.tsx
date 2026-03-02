'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { TriageItemData, SubTaskData } from '../types';

interface Screen3Props {
  triageItems: TriageItemData[];
  subTasks: SubTaskData[];
  setSubTasks: React.Dispatch<React.SetStateAction<SubTaskData[]>>;
  openNA: (tab: string) => void;
  courseId: string;
}

export default function Screen3Tasks({ triageItems, subTasks, setSubTasks, openNA, courseId }: Screen3Props) {
  const active = triageItems.filter((i) => i.column !== 'nice');
  const [expanded, setExpanded] = useState<string | null>(active[0]?.id || null);

  // Per-sub-task debounce timers for autosave
  const saveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Track temp IDs that are still being POSTed
  const pendingCreates = useRef<Set<string>>(new Set());

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      saveTimers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const addSub = (parentId: string) => {
    const existingSubs = subTasks.filter((s) => s.parentItemId === parentId);
    const tempId = `sub-${Date.now()}`;
    const newSub: SubTaskData = {
      id: tempId,
      parentItemId: parentId,
      text: '',
      isNew: 'New',
      sortOrder: existingSubs.length + 1,
    };
    // Optimistic UI
    setSubTasks((p) => [...p, newSub]);
    // Persist
    pendingCreates.current.add(tempId);
    fetch(`/api/courses/${courseId}/triage-items/${parentId}/sub-tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newSub.text, isNew: newSub.isNew, sortOrder: newSub.sortOrder }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create sub-task');
        return res.json();
      })
      .then((created) => {
        pendingCreates.current.delete(tempId);
        setSubTasks((p) => p.map((s) => (s.id === tempId ? { ...s, id: created.id } : s)));
      })
      .catch(() => {
        pendingCreates.current.delete(tempId);
        setSubTasks((p) => p.filter((s) => s.id !== tempId));
      });
  };

  const updateSub = useCallback((id: string, field: string, value: string) => {
    setSubTasks((p) => p.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    // Skip API for temp IDs (POST still in flight)
    if (id.startsWith('sub-') && pendingCreates.current.has(id)) return;
    // Find parentItemId for the URL
    const sub = subTasks.find((s) => s.id === id);
    if (!sub) return;
    // Debounce per sub-task (1s)
    const existing = saveTimers.current.get(id);
    if (existing) clearTimeout(existing);
    saveTimers.current.set(
      id,
      setTimeout(() => {
        saveTimers.current.delete(id);
        fetch(`/api/courses/${courseId}/triage-items/${sub.parentItemId}/sub-tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value }),
        }).catch(() => { /* silent */ });
      }, 1000)
    );
  }, [courseId, subTasks, setSubTasks]);

  const removeSub = (id: string) => {
    setSubTasks((p) => p.filter((s) => s.id !== id));
    // Clear any pending save timer
    const timer = saveTimers.current.get(id);
    if (timer) { clearTimeout(timer); saveTimers.current.delete(id); }
    // Skip API call for temp IDs
    if (pendingCreates.current.has(id)) {
      pendingCreates.current.delete(id);
      return;
    }
    // Find parentItemId for the URL
    const sub = subTasks.find((s) => s.id === id);
    if (!sub) return;
    fetch(`/api/courses/${courseId}/triage-items/${sub.parentItemId}/sub-tasks/${id}`, {
      method: 'DELETE',
    }).catch(() => { /* silent */ });
  };

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-gray-900">Task Breakdown</h2>
        <button
          onClick={() => openNA('system')}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-[#03428e] bg-[#e8eef7] border border-[#03428e]/20 rounded cursor-pointer hover:bg-[#dbe4f3]"
        >
          <span className="text-[13px]">📋</span> Needs Analysis Data
        </button>
      </div>
      <p className="text-[13px] text-gray-500 mb-4">
        Break tasks into observable sub-steps. Only &quot;New&quot; sub-tasks generate objectives.
      </p>

      <div className="flex flex-col gap-2">
        {active.map((task) => {
          const subs = subTasks.filter((s) => s.parentItemId === task.id);
          const isExp = expanded === task.id;
          const newCount = subs.filter((s) => s.isNew === 'New').length;
          return (
            <div key={task.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpanded(isExp ? null : task.id)}
                className={`w-full flex items-center justify-between px-4 py-3 border-none cursor-pointer text-left ${
                  isExp ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div>
                  <div className="text-[13px] font-semibold text-gray-900">{task.text}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-500">
                      {task.source === 'Custom'
                        ? 'Custom'
                        : 'From NA'}
                    </span>
                    <span className="text-[10px] text-gray-500">&bull;</span>
                    <span
                      className={`text-[10px] ${
                        newCount > 0 ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {subs.length} sub-tasks &bull; {newCount} for objectives
                    </span>
                  </div>
                </div>
                <span className="text-gray-500 text-base">{isExp ? '∧' : '∨'}</span>
              </button>
              {isExp && (
                <div className="px-4 pb-4">
                  {subs.map((sub, i) => (
                    <div
                      key={sub.id}
                      className={`flex gap-2 items-center mb-1.5 ${
                        sub.isNew === 'Already can do' ? 'opacity-50' : ''
                      }`}
                    >
                      <span className="text-[11px] text-gray-500 w-5 text-right">
                        {i + 1}.
                      </span>
                      <input
                        value={sub.text}
                        onChange={(e) => updateSub(sub.id, 'text', e.target.value)}
                        placeholder="Describe the sub-task…"
                        className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs outline-none focus:ring-2 focus:ring-[#03428e] focus:border-[#03428e]"
                      />
                      <select
                        value={sub.isNew}
                        onChange={(e) => updateSub(sub.id, 'isNew', e.target.value)}
                        className={`px-2 py-1 border border-gray-200 rounded text-[11px] ${
                          sub.isNew === 'New'
                            ? 'text-green-600'
                            : sub.isNew === 'Uncertain'
                            ? 'text-amber-600'
                            : 'text-gray-500'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Already can do">Already can do</option>
                        <option value="Uncertain">Uncertain ❓</option>
                      </select>
                      <button
                        onClick={() => removeSub(sub.id)}
                        className="border-none bg-none cursor-pointer text-gray-500 text-sm hover:text-red-500 p-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addSub(task.id)}
                    className="px-3 py-1.5 text-[11px] text-[#03428e] bg-transparent border border-dashed border-[#03428e]/40 rounded cursor-pointer mt-1 hover:bg-[#e8eef7]/50"
                  >
                    + Add step
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Task Analysis Sync placeholder */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3.5 flex items-center gap-2.5">
        <span>🔗</span>
        <div>
          <div className="text-xs font-semibold text-gray-900">Task Analysis Sync</div>
          <div className="text-[11px] text-gray-500">
            Not started. When completed, tasks sync bidirectionally.
          </div>
        </div>
      </div>
    </div>
  );
}
