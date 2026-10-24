// Dependency-free "scrying map": an SVG disc centred on the user. Sightings are projected by
// real distance/bearing, pulsing red when hazardous; dashed halos mark geographic patterns.
import { ALERT_HAZARD } from '../config/app';
import { CATEGORIES, sightingEmoji } from '../config/categories';
import { formatDistance, projectToUnit } from '../utils/geo';

const PLOT_RADIUS = 92; // viewBox units available for plotting (the disc is 98)
const RINGS = [1 / 3, 2 / 3, 1];

export default function EnchantedMap({ center, sightings, patterns, radiusKm, selectedId, onSelect }) {
  const place = (coords) => {
    const { x, y } = projectToUnit(center, coords, radiusKm);
    return { x: x * PLOT_RADIUS, y: y * PLOT_RADIUS };
  };

  return (
    <svg viewBox="-100 -100 200 200" className="map" role="group" aria-label="Enchanted map of nearby sightings">
      <defs>
        <radialGradient id="mapBg">
          <stop offset="0" className="map-center-stop" stopOpacity=".85" />
          <stop offset="1" className="map-edge-stop" stopOpacity=".92" />
        </radialGradient>
        <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" className="map-sweep-stop" stopOpacity="0" />
          <stop offset="1" className="map-sweep-stop" stopOpacity=".4" />
        </linearGradient>
      </defs>

      <circle r="98" fill="url(#mapBg)" className="map-disc" />
      {RINGS.map((fraction) => (
        <g key={fraction}>
          <circle r={PLOT_RADIUS * fraction} className="map-ring" />
          <text y={-PLOT_RADIUS * fraction + 5} className="map-ring-label">{formatDistance(radiusKm * fraction)}</text>
        </g>
      ))}
      <path d="M-98 0H98M0-98V98" className="map-axis" />
      <text y="-90" className="map-compass">N</text>

      <path d="M0 0 0-98A98 98 0 0 1 69-69Z" fill="url(#sweepGrad)">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="7s" repeatCount="indefinite" />
      </path>

      {patterns.map((pattern) => {
        const { x, y } = place(pattern.center);
        return <circle key={pattern.key} cx={x} cy={y} r={8 + pattern.count * 3} className={`map-pattern ${pattern.kind === 'hazard' ? 'hazard' : ''}`} />;
      })}

      {sightings.map((sighting) => {
        const { x, y } = place(sighting.coords);
        const classes = ['pin', sighting.hazard >= ALERT_HAZARD && 'hazard', sighting.id === selectedId && 'selected'].filter(Boolean).join(' ');
        return (
          <g
            key={sighting.id}
            transform={`translate(${x} ${y})`}
            className={classes}
            role="button"
            tabIndex={0}
            aria-label={sighting.title}
            onClick={() => onSelect(sighting.id)}
            onKeyDown={(event) => event.key === 'Enter' && onSelect(sighting.id)}
          >
            <circle r="9" className="pin-ring" style={{ '--c': CATEGORIES[sighting.category].color }} />
            <circle r="6.5" className="pin-core" />
            <text className="pin-emoji" dy=".35em">{sightingEmoji(sighting)}</text>
          </g>
        );
      })}

      <g className="you">
        <circle r="3.2" className="you-dot" />
        <text y="-7" className="you-label">👠</text>
      </g>
    </svg>
  );
}
