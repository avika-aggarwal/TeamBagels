// Facebook Graph API connector — "the village".
//  placeAt(coords)                       : name of the place at a coordinate (automatic location stacking)
//  findNearbyExperts({ coords, topic })  : community-verified people near a point who know the topic
//  requestVerification({ sighting, expert }) : pings an expert to confirm a sighting
// Endpoint paths below are placeholders — swap them for your real Graph / Wanderlust routes.
import { CONFIG, isConfigured } from '../../config/env';
import { http } from '../_shared/http';
import { withFallback } from '../_shared/withFallback';
import { findNearbyExpertsMock, placeAtMock, requestVerificationMock } from './mock';

const ready = () => isConfigured(CONFIG.facebook.accessToken);
const query = (extra) => ({ access_token: CONFIG.facebook.accessToken, ...extra });
const graph = (path) => `${CONFIG.facebook.baseUrl}${path}`;

export const placeAt = withFallback(
  'graph-place',
  ready,
  async (coords) => {
    const result = await http.get(graph('/search'), { query: query({ type: 'place', center: `${coords.lat},${coords.lng}`, distance: 500, limit: 1 }) });
    return result.data[0]?.name || 'Uncharted Glade';
  },
  placeAtMock,
);

export const findNearbyExperts = withFallback(
  'graph-experts',
  () => ready() && isConfigured(CONFIG.facebook.nearbyExpertsPath),
  async ({ coords, topic }) => {
    const result = await http.get(graph(CONFIG.facebook.nearbyExpertsPath), { query: query({ lat: coords.lat, lng: coords.lng, topic }) });
    return result.data;
  },
  findNearbyExpertsMock,
);

export const requestVerification = withFallback(
  'graph-verify',
  () => ready() && isConfigured(CONFIG.facebook.nearbyExpertsPath),
  ({ sighting, expert }) => http.post(graph(`/${expert.id}/verification_requests`), { sightingId: sighting.id }, { query: query() }),
  requestVerificationMock,
);
