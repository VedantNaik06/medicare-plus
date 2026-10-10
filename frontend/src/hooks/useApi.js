import { useCallback, useEffect, useRef, useState } from 'react';

// Loads data and ALWAYS ends in one of three states: data, empty data, or an error.
//   const { data, loading, error, reload } = useApi(() => medicineApi.list(), []);
export function useApi(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const latest = useRef(0);

  const reload = useCallback(async ({ silent = false } = {}) => {
    const id = ++latest.current;
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn();
      if (id === latest.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (id === latest.current) setState({ data: null, loading: false, error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
    return () => { latest.current += 1; }; // ignore results that arrive after we left the page
  }, [reload]);

  return { ...state, reload };
}
