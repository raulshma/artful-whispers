import { useEffect, useRef, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  onIntersect?: (entry: IntersectionObserverEntry) => void;
}

export function useIntersectionObserver({
  threshold = 0.5,
  rootMargin = '0px',
  onIntersect,
}: UseIntersectionObserverOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());

  const callback = useCallback((entries: IntersectionObserverEntry[]) => {
    const visibleEntry = entries.find(
      (entry) => entry.isIntersecting && entry.intersectionRatio >= threshold
    );
    if (visibleEntry && onIntersect) {
      onIntersect(visibleEntry);
    }
  }, [onIntersect, threshold]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, {
      threshold,
      root: null,
      rootMargin,
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [callback, threshold, rootMargin]);

  const observeElement = useCallback((id: string, element: HTMLElement | null) => {
    if (!element || !observerRef.current) return;

    // Unobserve previous element with same id if it exists
    const previousElement = elementsRef.current.get(id);
    if (previousElement && previousElement !== element) {
      observerRef.current.unobserve(previousElement);
    }

    // Observe new element
    elementsRef.current.set(id, element);
    observerRef.current.observe(element);
  }, []);

  const unobserveElement = useCallback((id: string) => {
    const element = elementsRef.current.get(id);
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
      elementsRef.current.delete(id);
    }
  }, []);

  return { observeElement, unobserveElement };
}
