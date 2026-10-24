// Live 0–40 Hz spectrum bars with the Fear Frequency band (18.9 Hz) glowing in gold/rose.
// Receives the `analysis` object from connectors/infrasound/analyzer.js (null while idle).
import { INFRASOUND } from '../config/app';
import { clamp } from '../utils/format';

const WIDTH = 296;
const HEIGHT = 100;
const IDLE = { bins: Array(28).fill(-110), binHz: INFRASOUND.maxHz / 27 };
const toLevel = (db) => clamp((db + 110) / 80, 0.03, 1); // -110 dB (silence) .. -30 dB (loud)
const toX = (hz) => 2 + (hz / INFRASOUND.maxHz) * WIDTH;

export default function SpectrumGauge({ analysis }) {
  const { targetHz, bandHz, maxHz } = INFRASOUND;
  const { bins, binHz } = analysis ?? IDLE;

  return (
    <svg viewBox={`0 0 300 ${HEIGHT + 28}`} className="spectrum" role="img" aria-label="Infrasound spectrum, 0 to 40 hertz">
      {bins.map((db, index) => {
        const hz = index * binHz;
        const height = toLevel(db) * HEIGHT;
        const inBand = Math.abs(hz - targetHz) <= bandHz;
        return <rect key={index} x={toX(hz)} y={HEIGHT - height} width={Math.max(2, (binHz / maxHz) * WIDTH - 1.5)} height={height} rx="2" className={inBand ? 'bar band' : 'bar'} />;
      })}
      <line x1={toX(targetHz)} x2={toX(targetHz)} y1="0" y2={HEIGHT} className="spectrum-marker" />
      <text x={toX(targetHz)} y={HEIGHT + 24} className="spectrum-label marker">{targetHz} Hz</text>
      {[0, 10, 20, 30, 40].map((hz) => (
        <text key={hz} x={toX(hz)} y={HEIGHT + 12} className="spectrum-label">{hz}</text>
      ))}
    </svg>
  );
}
