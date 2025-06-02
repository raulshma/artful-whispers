import { useEffect, useRef } from 'react';

interface UsePerformanceOptions {
  name: string;
  enabled?: boolean;
}

export function usePerformance({ name, enabled = process.env.NODE_ENV === 'development' }: UsePerformanceOptions) {
  const startTime = useRef<number>();
  const mountTime = useRef<number>();

  useEffect(() => {
    if (!enabled) return;
    
    startTime.current = performance.now();
    
    // Track component mount time
    const timeout = setTimeout(() => {
      mountTime.current = performance.now();
      const renderTime = mountTime.current - (startTime.current || 0);
      console.log(`🚀 ${name} render time: ${renderTime.toFixed(2)}ms`);
    }, 0);

    return () => {
      clearTimeout(timeout);
      if (mountTime.current && startTime.current) {
        const totalTime = performance.now() - startTime.current;
        console.log(`🏁 ${name} total lifecycle: ${totalTime.toFixed(2)}ms`);
      }
    };
  }, [name, enabled]);

  const measureOperation = (operationName: string, fn: () => void) => {
    if (!enabled) {
      fn();
      return;
    }
    
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`⚡ ${name} - ${operationName}: ${(end - start).toFixed(2)}ms`);
  };

  return { measureOperation };
}
