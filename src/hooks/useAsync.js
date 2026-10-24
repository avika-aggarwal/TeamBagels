// Runs an async function when `deps` change and exposes { data, loading }.
// Ignores results from stale runs so quick re-renders can't show old data.
import { useEffect, useState } from 'react';

export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, loading: true });

  useEffect(() => {
    let live = true;
    setState((previous) => ({ ...previous, loading: true }));
    fn()
      .then((data) => live && setState({ data, loading: false }))
      .catch(() => live && setState({ data: null, loading: false }));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
