import { useEffect, useState } from "react";

// Runs fetchFn whenever `deps` change, tracking { data, loading, error }.
// Shared by the auto-loading pages so the fetch lifecycle lives in one place.
// Ignores a stale response if deps change before it resolves (avoids an old
// country's data overwriting a newer selection).
export function useApiData(fetchFn, deps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFn()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
