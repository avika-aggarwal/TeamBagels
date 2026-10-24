// One sighting as a tilting glass card: art/photo, title, place, distance, hazard vials,
// verification status and a tappable reporter. `expanded` also reveals the description.
import { HAZARD_LEVELS } from '../config/app';
import { CATEGORIES, sightingEmoji } from '../config/categories';
import { useApp } from '../state/AppContext';
import { formatDistance } from '../utils/geo';
import { timeAgo } from '../utils/format';
import GlassCard from './GlassCard';
import PotionMeter from './PotionMeter';
import VerificationBadge from './VerificationBadge';

export default function SightingCard({ sighting, expanded = false, onSelect }) {
  const { openProfile } = useApp();
  const category = CATEGORIES[sighting.category];

  return (
    <GlassCard tilt className={`sighting ${expanded ? 'expanded' : ''}`} style={{ '--accent-color': category.color }} onClick={() => onSelect?.(sighting.id)}>
      <div className="sighting-art">
        {sighting.photo ? <img src={sighting.photo} alt={sighting.title} /> : sightingEmoji(sighting)}
      </div>
      <div className="sighting-body">
        <div className="sighting-meta">
          <span className="sighting-cat">{category.label}</span>
          <span>{sighting.distanceKm != null && `${formatDistance(sighting.distanceKm)} · `}{timeAgo(sighting.createdAt)}</span>
        </div>
        <h3>{sighting.title}</h3>
        <p className="sighting-place">📍 {sighting.place}</p>
        {expanded && <p className="sighting-desc">{sighting.description}</p>}
        <div className="sighting-foot">
          {sighting.hazard > 0 && (
            <span className="hazard-tag"><PotionMeter value={sighting.hazard} /> {HAZARD_LEVELS[sighting.hazard]}</span>
          )}
          <VerificationBadge verification={sighting.verification} />
          <button
            className="reporter"
            onClick={(event) => {
              event.stopPropagation();
              openProfile(sighting.reporter.id);
            }}
          >
            {sighting.reporter.emoji} {sighting.reporter.name}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
