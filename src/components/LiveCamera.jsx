// Live viewfinder with a glowing reticle. There is intentionally no gallery/upload picker:
// only what the camera sees right now can be scanned. Shows a hint when the camera is unavailable.
import { CONFIG } from '../config/env';

export default function LiveCamera({ videoRef, status }) {
  return (
    <div className="camera">
      <video ref={videoRef} autoPlay playsInline muted />
      <div className="reticle">
        <i /><i /><i /><i />
        <span className="reticle-beam" />
      </div>
      {status !== 'ready' && (
        <p className="camera-note">
          {status === 'starting'
            ? 'Waking the mirror…'
            : `The mirror can't see — camera blocked or unavailable. ${CONFIG.allowDemoCapture ? 'Tap the wand to conjure a demo vision.' : 'Allow camera access and use HTTPS or localhost.'}`}
        </p>
      )}
    </div>
  );
}
