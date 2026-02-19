'use client';
import { useState, useEffect } from 'react';

export function usePageByType(courseId: string, pageType: string) {
  const [pageId, setPageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPage() {
      try {
        const res = await fetch(`/api/courses/${courseId}/overview`);
        if (!res.ok) throw new Error('Failed to load course');
        const data = await res.json();
        const page = data.pages?.find((p: any) => p.type === pageType);
        if (page) {
          setPageId(page.id);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPage();
  }, [courseId, pageType]);

  return { pageId, isLoading, error, notFound };
}
