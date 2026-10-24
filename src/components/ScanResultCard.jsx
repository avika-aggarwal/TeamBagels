// The Scan screen's result: photo with authenticity ribbon, identification, potion-hazard gauge,
// Muse's narration (tap to hear it), research sources, look-alikes and safety disclaimers.
import { DISCLAIMERS, HAZARD_LEVELS } from '../config/app';
import { speak } from '../connectors/muse';
import GlassCard from './GlassCard';
import MagicButton from './MagicButton';
import PotionMeter from './PotionMeter';

export default function ScanResultCard({ photo, result, posting, onPost, onRescan }) {
  return (
    <GlassCard className="scan-result">
      <div className="scan-photo">
        <img src={photo.dataUrl} alt="Your live capture" />
        <span className={`ribbon ${result.authentic ? 'ok' : 'warn'}`}>
          {result.authentic ? '✔ Live-verified capture' : '⚠ Unverified capture'}
        </span>
      </div>

      <h2>{result.emoji} {result.name}</h2>
      <p className="latin">{result.scientificName}</p>

      <div className="confidence" aria-label={`Confidence ${Math.round(result.confidence * 100)}%`}>
        <span style={{ width: `${result.confidence * 100}%` }} />
        <em>{Math.round(result.confidence * 100)}% sure</em>
      </div>

      <div className="hazard-row">
        <PotionMeter value={result.hazard} />
        <strong>{HAZARD_LEVELS[result.hazard]}</strong>
      </div>

      <p>{result.summary}</p>
      {result.hazard > 0 && <p className="danger-text">☠️ {result.dangers}</p>}
      <p className="authenticity-note">🔎 {result.authenticityNote}</p>

      <button className="muse-bubble" onClick={() => speak(result.narration)} title="Tap to hear the Investigator">
        <span>🕯️</span> {result.narration} <small>🔊 tap to listen</small>
      </button>

      {result.lookalikes.length > 0 && (
        <>
          <h4>Beware the look-alikes</h4>
          <div className="tags">{result.lookalikes.map((name) => <span key={name}>{name}</span>)}</div>
        </>
      )}

      <h4>From the ancient tomes</h4>
      <p className="research">{result.research.summary}</p>
      {result.research.images.length > 0 && (
        <div className="research-images">{result.research.images.map((src) => <img key={src} src={src} alt="" />)}</div>
      )}
      <ul className="sources">
        {result.research.sources.map(({ title, link }) => (
          <li key={link}><a href={link} target="_blank" rel="noreferrer">{title}</a></li>
        ))}
      </ul>

      <ul className="disclaimers">{DISCLAIMERS.map((text) => <li key={text}>{text}</li>)}</ul>

      <div className="actions">
        <MagicButton onClick={onPost} disabled={posting}>{posting ? 'Casting to the realm…' : '✨ Post to the Realm'}</MagicButton>
        <MagicButton variant="ghost" onClick={onRescan}>Scan another</MagicButton>
      </div>
    </GlassCard>
  );
}
