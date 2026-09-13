import { useEffect, useRef, useState } from 'react';

// How long the ARÍLÉ mark stays up at minimum, so it never just flashes
// even when images load instantly from cache.
const MIN_DISPLAY_MS = 900;

// Hard ceiling — if images are slow or one never fires (bad URL, offline),
// we stop waiting and let the site through anyway.
const MAX_WAIT_MS = 6000;

interface PreloaderState {
  /** 0–100 */
  progress: number;
  /** true once loading has finished (or timed out) and the minimum display time has passed */
  done: boolean;
}

/**
 * Preloads a fixed list of image URLs and reports progress as they resolve.
 * `urls` is only read on mount — pass a stable (module-level or memoized) array.
 */
export function useAssetPreloader(urls: string[]): PreloaderState {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(urls.length === 0);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    const unique = Array.from(new Set(urls));

    if (unique.length === 0) {
      setProgress(100);
      setDone(true);
      return;
    }

    let cancelled = false;
    let loaded = 0;

    const finish = () => {
      if (cancelled) return;
      const elapsed = Date.now() - startedAt.current;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      window.setTimeout(() => {
        if (!cancelled) setDone(true);
      }, remaining);
    };

    const markOne = () => {
      if (cancelled) return;
      loaded += 1;
      setProgress(Math.round((loaded / unique.length) * 100));
      if (loaded >= unique.length) finish();
    };

    unique.forEach((src) => {
      const img = new Image();
      img.onload = markOne;
      img.onerror = markOne; // a missing/broken image shouldn't hang the site forever
      img.src = src;
    });

    const safety = window.setTimeout(() => {
      if (!cancelled) {
        setProgress(100);
        finish();
      }
    }, MAX_WAIT_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
    };
    // Intentionally run once — `urls` is expected to be a stable reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { progress, done };
}
