import { useCallback, useEffect, useRef, useState } from "react";

// * Small fetch helper. Ignores answers that arrive after the inputs changed. reload() fetches again.
// * refreshMs: also refetch quietly (no loading flicker) on a timer and whenever the tab becomes visible again.
export const useFetch = <T>(fetcher: () => Promise<T>, deps: unknown[], isEnabled = true, refreshMs?: number) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(isEnabled);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const isQuietRef = useRef(false);

  useEffect(() => {
    if (!isEnabled) return;
    let isCancelled = false;
    const isQuiet = isQuietRef.current;
    isQuietRef.current = false;
    if (!isQuiet) {
      setIsLoading(true);
      setHasError(false);
    }
    fetcher()
      .then((result) => { if (!isCancelled) { setData(result); setHasError(false); } })
      .catch(() => { if (!isCancelled && !isQuiet) setHasError(true); })
      .finally(() => { if (!isCancelled) setIsLoading(false); });
    return () => { isCancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, isEnabled, reloadKey]);

  useEffect(() => {
    if (!isEnabled || !refreshMs) return;
    const refreshQuietly = () => {
      if (document.visibilityState !== "visible") return;
      isQuietRef.current = true;
      setReloadKey((key) => key + 1);
    };
    const timer = window.setInterval(refreshQuietly, refreshMs);
    document.addEventListener("visibilitychange", refreshQuietly);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refreshQuietly); };
  }, [isEnabled, refreshMs]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  return { data, isLoading, hasError, reload };
};
