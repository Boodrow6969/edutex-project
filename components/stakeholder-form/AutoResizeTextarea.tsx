'use client';

import { useRef, useEffect, useCallback, TextareaHTMLAttributes } from 'react';

const MIN_ROWS = 4;
const MAX_ROWS = 16;
const LINE_HEIGHT = 24; // approx line height for text-sm

interface AutoResizeTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'> {
  value: string;
  onValueChange: (value: string) => void;
}

export function AutoResizeTextarea({
  value,
  onValueChange,
  className = '',
  ...props
}: AutoResizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const minHeight = MIN_ROWS * LINE_HEIGHT;
    const maxHeight = MAX_ROWS * LINE_HEIGHT;

    // Reset to min so scrollHeight reflects actual content
    el.style.height = `${minHeight}px`;
    const desired = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
    el.style.height = `${desired}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      onInput={resize}
      rows={MIN_ROWS}
      className={`resize-none ${className}`}
      style={{
        minHeight: `${MIN_ROWS * LINE_HEIGHT}px`,
        maxHeight: `${MAX_ROWS * LINE_HEIGHT}px`,
      }}
      {...props}
    />
  );
}
