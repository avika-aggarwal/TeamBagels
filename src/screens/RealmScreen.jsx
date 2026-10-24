// Realm (home): the magic mirror, filters, the enchanted map, geographic "pattern whispers"
// and the nearby sightings feed. Everything on this screen reacts to the same filtered list.
import { useMemo, useState } from 'react';
import Chip from '../components/Chip';
import EnchantedMap from '../components/EnchantedMap';
import GlassCard from '../components/GlassCard';
import MagicMirror from '../components/MagicMirror';
import SightingCard from '../components/SightingCard';
import { RADII } from '../config/app';
import { CATEGORIES } from '../config/categories';
import { detectPatterns, nearbySightings } from '../services/sightingsService';
import { useApp } from '../state/AppContext';

const matchesQuery = (sighting, query) =>
  `${sighting.title} ${sighting.place} ${sighting.description} ${CATEGORIES[sighting.category].label}`.toLowerCase().includes(query.trim().toLowerCase());

export default function RealmScreen() {
  const { sightings, location, selectedId, setSelectedId } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [radiusKm, setRadiusKm] = useState(RADII[1].km);

  const visible = useMemo(
    () => nearbySightings(sightings, location.coords, radiusKm).filter((s) => (!category || s.category === category) && matchesQuery(s, query)),
    [sightings, location.coords, radiusKm, category, query],
  );
  const patterns = useMemo(() => detectPatterns(visible), [visible]);
  const selected = visible.find((s) => s.id === selectedId);

  return (
    <>
      <MagicMirror query={query} onQuery={setQuery} vision={visible[0]} onOpen={(s) => setSelectedId(s.id)} />

      <div className="chips">
        <Chip active={!category} onClick={() => setCategory(null)}>✨ All</Chip>
        {Object.entries(CATEGORIES).map(([id, { label, emoji, color }]) => (
          <Chip key={id} active={category === id} color={color} onClick={() => setCategory(category === id ? null : id)}>{emoji} {label}</Chip>
        ))}
      </div>
      <div className="chips">
        {RADII.map(({ km, label }) => (
          <Chip key={km} active={radiusKm === km} onClick={() => setRadiusKm(km)}>🔭 {label}</Chip>
        ))}
      </div>

      <GlassCard className="map-card">
        <EnchantedMap center={location.coords} sightings={visible} patterns={patterns} radiusKm={radiusKm} selectedId={selectedId} onSelect={setSelectedId} />
        <p className="map-caption">
          📍 {location.placeName}{location.approximate && ' (approximate)'} · {visible.length} sighting{visible.length === 1 ? '' : 's'}
        </p>
      </GlassCard>

      {patterns.length > 0 && (
        <GlassCard className="patterns">
          <h3>🔮 Pattern whispers</h3>
          {patterns.map((pattern) => <p key={pattern.key} className={pattern.kind === 'hazard' ? 'danger-text' : ''}>{pattern.label}</p>)}
        </GlassCard>
      )}

      {selected && <SightingCard sighting={selected} expanded />}

      <h3 className="section-title">Sightings near you</h3>
      {visible.length === 0 && <p className="empty">The mirror finds nothing here. Try a wider scry radius.</p>}
      {visible.filter((s) => s.id !== selectedId).map((sighting) => (
        <SightingCard key={sighting.id} sighting={sighting} onSelect={setSelectedId} />
      ))}
    </>
  );
}
