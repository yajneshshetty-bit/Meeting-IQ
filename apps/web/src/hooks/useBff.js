import { useEffect, useState } from 'react';
import { bffFetch } from '../api/client.js';
import { useUser } from '../context/UserContext.jsx';

export function useBff(path, { deps = [], skip = false } = {}) {
  const { userId } = useUser();
  const [data, setData] = useState(null);
  const [freshness, setFreshness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (skip || !userId) return;
    let cancelled = false;
    setLoading(true);
    bffFetch(path, { userId })
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        setFreshness(res.freshness);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [path, userId, skip, ...deps]);

  return { data, freshness, loading, error };
}
