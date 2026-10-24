// React wrapper around the infrasound connector.
// Exposes the latest analysis `frame` plus start / stop / injectTone controls.
import { useCallback, useEffect, useRef, useState } from 'react';
import { startListening } from '../connectors/infrasound';

export function useInfrasound() {
  const [frame, setFrame] = useState(null);
  const [listening, setListening] = useState(false);
  const [micAvailable, setMicAvailable] = useState(true);
  const session = useRef(null);

  const stop = useCallback(() => {
    session.current?.stop();
    session.current = null;
    setListening(false);
    setFrame(null);
  }, []);

  const start = useCallback(async () => {
    session.current = await startListening(setFrame);
    setMicAvailable(session.current.micAvailable);
    setListening(true);
  }, []);

  useEffect(() => stop, [stop]); // release the mic when leaving the screen

  return { frame, listening, micAvailable, start, stop, injectTone: () => session.current?.injectTone(3000) };
}
