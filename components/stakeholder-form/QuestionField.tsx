'use client';

import { useState, useEffect } from 'react';
import { AutoResizeTextarea } from './AutoResizeTextarea';
import { DateWithTextInput } from './DateWithTextInput';

interface Question {
  id: string;
  section: string;
  questionText: string;
  stakeholderGuidance: string;
  fieldType: string;
  required: boolean;
  options?: string[];
  tableColumns?: { key: string; label: string }[];
  displayOrder: number;
  conditional?: {
    questionId: string;
    operator: 'equals' | 'not_equals' | 'includes';
    value: string;
  };
}

interface QuestionFieldProps {
  question: Question;
  value: string;
  onChange: (questionId: string, value: string) => void;
  validationError?: boolean;
}

const inputClasses =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#03428e] focus:border-transparent transition-colors';

export function QuestionField({
  question,
  value,
  onChange,
  validationError,
}: QuestionFieldProps) {
  const errorRing = validationError ? 'ring-2 ring-red-400 border-red-400' : '';

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-sm font-medium text-gray-900">
          {question.questionText}
          {question.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </span>
      </label>

      {question.stakeholderGuidance && (
        <p className="text-xs text-gray-500 leading-relaxed">
          {question.stakeholderGuidance}
        </p>
      )}

      {renderField(question, value, onChange, errorRing)}

      {validationError && (
        <p className="text-xs text-red-600">This field is required.</p>
      )}
    </div>
  );
}

function renderField(
  question: Question,
  value: string,
  onChange: (id: string, val: string) => void,
  errorRing: string
) {
  const { fieldType, id, options } = question;

  switch (fieldType) {
    case 'SHORT_TEXT':
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className={`${inputClasses} ${errorRing}`}
        />
      );

    case 'LONG_TEXT':
      return (
        <AutoResizeTextarea
          value={value}
          onValueChange={(v) => onChange(id, v)}
          className={`${inputClasses} ${errorRing}`}
        />
      );

    case 'SINGLE_SELECT':
      return (
        <div className="space-y-2">
          {(options ?? []).map((opt) => (
            <label
              key={opt}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name={`q-${id}`}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(id, opt)}
                className="mt-0.5 h-4 w-4 text-[#03428e] border-gray-300 focus:ring-[#03428e] shrink-0"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {opt}
              </span>
            </label>
          ))}
        </div>
      );

    case 'MULTI_SELECT':
      return (
        <div className="space-y-2">
          {(options ?? []).map((opt) => {
            const selected = value
              .split(',')
              .filter(Boolean)
              .includes(opt);
            return (
              <label
                key={opt}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => {
                    const current = value
                      .split(',')
                      .filter(Boolean);
                    const next = selected
                      ? current.filter((v) => v !== opt)
                      : [...current, opt];
                    onChange(id, next.join(','));
                  }}
                  className="mt-0.5 h-4 w-4 text-[#03428e] border-gray-300 rounded focus:ring-[#03428e] shrink-0"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {opt}
                </span>
              </label>
            );
          })}
        </div>
      );

    case 'DATE':
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className={`${inputClasses} ${errorRing}`}
        />
      );

    case 'DATE_WITH_TEXT':
      return (
        <DateWithTextInput
          id={id}
          value={value}
          onChange={(val) => onChange(id, val)}
          className={`${inputClasses} ${errorRing}`}
        />
      );

    case 'NUMBER':
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className={`${inputClasses} max-w-xs ${errorRing}`}
        />
      );

    case 'SCALE':
      return (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(id, String(n))}
              className={`w-10 h-10 rounded-lg text-sm font-medium border transition-colors ${
                value === String(n)
                  ? 'bg-[#03428e] text-white border-[#03428e]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#03428e]'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      );

    case 'REPEATING_TABLE':
      return (
        <RepeatingTable
          id={id}
          columns={question.tableColumns ?? []}
          value={value}
          onChange={onChange}
          errorRing={errorRing}
        />
      );

    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className={`${inputClasses} ${errorRing}`}
        />
      );
  }
}

// ── Repeating Table sub-component ──────────────────────────────────────

interface RepeatingTableProps {
  id: string;
  columns: { key: string; label: string }[];
  value: string;
  onChange: (id: string, val: string) => void;
  errorRing: string;
}

function parseRows(
  value: string,
  columns: { key: string }[]
): Record<string, string>[] {
  if (!value) return [emptyRow(columns)];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return [emptyRow(columns)];
  } catch {
    // Legacy plain-string value — put it in the first column
    const row: Record<string, string> = {};
    columns.forEach((c, i) => {
      row[c.key] = i === 0 ? value : '';
    });
    return [row];
  }
}

function emptyRow(columns: { key: string }[]): Record<string, string> {
  const row: Record<string, string> = {};
  columns.forEach((c) => {
    row[c.key] = '';
  });
  return row;
}

function RepeatingTable({
  id,
  columns,
  value,
  onChange,
  errorRing,
}: RepeatingTableProps) {
  const [rows, setRows] = useState(() => parseRows(value, columns));

  // Sync from external value changes (e.g. loading saved responses)
  useEffect(() => {
    setRows(parseRows(value, columns));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = (updated: Record<string, string>[]) => {
    setRows(updated);
    onChange(id, JSON.stringify(updated));
  };

  const handleCellChange = (rowIdx: number, key: string, val: string) => {
    const updated = rows.map((r, i) =>
      i === rowIdx ? { ...r, [key]: val } : r
    );
    commit(updated);
  };

  const addRow = () => {
    commit([...rows, emptyRow(columns)]);
  };

  const removeRow = (rowIdx: number) => {
    if (rows.length <= 1) return;
    commit(rows.filter((_, i) => i !== rowIdx));
  };

  return (
    <div className={`rounded-lg border border-gray-300 overflow-hidden ${errorRing}`}>
      {/* Header */}
      <div
        className="grid bg-gray-50 border-b border-gray-300"
        style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr) 36px` }}
      >
        {columns.map((col) => (
          <div
            key={col.key}
            className="px-3 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide"
          >
            {col.label}
          </div>
        ))}
        <div />
      </div>

      {/* Rows */}
      {rows.map((row, ri) => (
        <div
          key={ri}
          className={`grid items-center ${ri > 0 ? 'border-t border-gray-200' : ''}`}
          style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr) 36px` }}
        >
          {columns.map((col) => (
            <div key={col.key} className="px-1">
              <input
                type="text"
                value={row[col.key] ?? ''}
                onChange={(e) => handleCellChange(ri, col.key, e.target.value)}
                className="w-full px-2 py-2 text-sm border-0 focus:outline-none focus:ring-0 bg-transparent"
                placeholder={col.label}
              />
            </div>
          ))}
          <div className="flex items-center justify-center">
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(ri)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove row"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add row */}
      <div className="border-t border-gray-200 px-3 py-2">
        <button
          type="button"
          onClick={addRow}
          className="text-xs font-medium text-[#03428e] hover:text-[#022d61] transition-colors"
        >
          + Add row
        </button>
      </div>
    </div>
  );
}
