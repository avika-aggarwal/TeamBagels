// Opens the live camera into a <video> ref and cleans up on unmount.
// status: "starting" | "ready" | "unavailable" (denied, no camera, or insecure origin).
import { useEffect, useRef, useState } from 'react';
import { openCamera, stopCamera } from '../connectors/camera';

export function useCamera() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('starting');

  useEffect(() => {
    let cancelled = false;
    let stream = null;
    openCamera()
      .then((opened) => {
        stream = opened;
        if (cancelled) return stopCamera(stream);
        videoRef.current.srcObject = stream;
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('unavailable'));
    return () => {
      cancelled = true;
      stopCamera(stream);
    };
  }, []);

  return { videoRef, status };
}
