'use client';

export interface ConditionalDef {
  questionId: string;
  operator: 'includes' | 'equals' | 'not_equals';
  value: string;
}

export interface ResponseItem {
  questionId: string;
  fieldType: string;
  conditional: ConditionalDef | null;
  value: string | null; // null = no response
}

export function parseMultiSelect(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fall through
  }
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

export function formatColumnHeader(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}

export function shouldShow(
  conditional: ConditionalDef | null,
  responseMap: Map<string, string>
): boolean {
  if (!conditional) return true;
  const parentValue = responseMap.get(conditional.questionId) ?? '';
  if (conditional.operator === 'includes') return parentValue.includes(conditional.value);
  if (conditional.operator === 'equals') return parentValue === conditional.value;
  if (conditional.operator === 'not_equals') return parentValue !== conditional.value;
  return true;
}

export function ResponseValue({ fieldType, value }: { fieldType: string; value: string | null }) {
  if (!value) {
    return <span className="text-gray-400 italic text-sm">No response</span>;
  }

  if (fieldType === 'MULTI_SELECT') {
    const items = parseMultiSelect(value);
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="inline-flex px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
            {item}
          </span>
        ))}
      </div>
    );
  }

  if (fieldType === 'SCALE') {
    return <span className="text-gray-900">{value} / 5</span>;
  }

  if (fieldType === 'REPEATING_TABLE') {
    let rows: Record<string, string>[];
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return <span className="text-gray-400 italic text-sm">No response</span>;
      }
      rows = parsed;
    } catch {
      return <span className="text-gray-900 whitespace-pre-wrap">{value}</span>;
    }
    const columns = Object.keys(rows[0]);
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200">
                  {formatColumnHeader(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2 text-gray-900 border-b border-gray-100">
                    {row[col] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <span className="text-gray-900 whitespace-pre-wrap">{value}</span>;
}
