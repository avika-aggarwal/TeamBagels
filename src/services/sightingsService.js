// Sightings service: list / create / vote, plus geographic helpers (nearby, patterns).
// Talks to the Wanderlust backend when VITE_API_BASE_URL is set; otherwise it stores
// everything in localStorage (seeded with demo data) so the app works offline.
import { CATEGORIES } from '../config/categories';
import { ALERT_HAZARD } from '../config/app';
import { CONFIG, isConfigured } from '../config/env';
import { withFallback } from '../connectors/_shared/withFallback';
import { http } from '../connectors/_shared/http';
import { buildSeedSightings } from '../data/seed';
import { distanceKm } from '../utils/geo';
import { readJson, writeJson } from '../utils/storage';

const STORE_KEY = 'wanderlust.sightings.v1';
const apiReady = () => isConfigured(CONFIG.api.baseUrl);
const endpoint = (path) => `${CONFIG.api.baseUrl}${path}`;

const readLocal = () => readJson(STORE_KEY, null) || writeAndReturn(buildSeedSightings());
function writeAndReturn(all) {
  writeJson(STORE_KEY, all);
  return all;
}

/** Two agreeing votes + a believable AI score verifies a sighting; two disagreeing dispute it. */
function applyVote(sighting, vote) {
  const votes = [...sighting.verification.votes.filter((v) => v.userId !== vote.userId), vote];
  const agree = votes.filter((v) => v.agree).length;
  const disagree = votes.length - agree;
  const status = agree >= 2 && sighting.verification.aiScore >= 0.5 ? 'verified' : disagree >= 2 ? 'disputed' : 'pending';
  return { ...sighting, verification: { ...sighting.verification, votes, status } };
}

export const listSightings = withFallback('sightings.list', apiReady, () => http.get(endpoint('/sightings')), async () => readLocal());

export const createSighting = withFallback(
  'sightings.create',
  apiReady,
  (sighting) => http.post(endpoint('/sightings'), sighting),
  async (sighting) => {
    const created = { id: `s_${Date.now()}`, createdAt: Date.now(), verification: { status: 'pending', aiScore: 0.5, votes: [] }, ...sighting };
    writeAndReturn([created, ...readLocal()]);
    return created;
  },
);

/** vote = { userId, agree }. Resolves with the updated sighting. */
export const voteOnSighting = withFallback(
  'sightings.vote',
  apiReady,
  (id, vote) => http.post(endpoint(`/sightings/${id}/votes`), vote),
  async (id, vote) => {
    const all = readLocal();
    const updated = applyVote(all.find((s) => s.id === id), vote);
    writeAndReturn(all.map((s) => (s.id === id ? updated : s)));
    return updated;
  },
);

/** Adds `distanceKm` to each sighting and keeps those inside the radius, nearest first. */
export const nearbySightings = (sightings, center, radiusKm) =>
  sightings
    .map((sighting) => ({ ...sighting, distanceKm: distanceKm(center, sighting.coords) }))
    .filter((sighting) => sighting.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

/**
 * Finds geographic patterns: sightings of the same kind (all hazards count as one kind)
 * that cluster in the same ~11 km grid cell. Returns [{ key, count, center, label }].
 */
export function detectPatterns(sightings) {
  const cells = new Map();
  sightings.forEach((sighting) => {
    const kind = sighting.hazard >= ALERT_HAZARD ? 'hazard' : sighting.category;
    const key = `${kind}:${Math.round(sighting.coords.lat * 10)}:${Math.round(sighting.coords.lng * 10)}`;
    cells.set(key, [...(cells.get(key) || []), { kind, sighting }]);
  });

  return [...cells.entries()]
    .filter(([, group]) => group.length >= 2)
    .map(([key, group]) => {
      const { kind } = group[0];
      const center = {
        lat: group.reduce((sum, g) => sum + g.sighting.coords.lat, 0) / group.length,
        lng: group.reduce((sum, g) => sum + g.sighting.coords.lng, 0) / group.length,
      };
      const noun = kind === 'hazard' ? 'potion perils' : CATEGORIES[kind].label.toLowerCase();
      return { key, count: group.length, center, kind, label: `${group.length} ${noun} gather within ~10 km` };
    });
}
