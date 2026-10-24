// Alert service: tells the user when a hazardous sighting appears nearby.
// Real mode: listens on a WebSocket (VITE_ALERTS_WS_URL) that pushes new sightings as JSON.
// Offline mode: simulates one incoming hazard shortly after launch so the flow can be demoed.
import { ALERT_HAZARD, DEMO_ALERT_DELAY_MS } from '../config/app';
import { CONFIG, isConfigured } from '../config/env';
import { demoIncomingSighting } from '../data/seed';
import { distanceKm } from '../utils/geo';

/** Calls onAlert(sighting) for hazards within radiusKm of `center`. Returns an unsubscribe fn. */
export function subscribeToAlerts({ center, radiusKm, onAlert }) {
  const accept = (sighting) => {
    if (sighting.hazard >= ALERT_HAZARD && distanceKm(center, sighting.coords) <= radiusKm) onAlert(sighting);
  };

  if (isConfigured(CONFIG.api.alertsWsUrl)) {
    const socket = new WebSocket(CONFIG.api.alertsWsUrl);
    socket.onmessage = (event) => accept(JSON.parse(event.data));
    return () => socket.close();
  }

  const timer = setTimeout(() => accept(demoIncomingSighting(center)), DEMO_ALERT_DELAY_MS);
  return () => clearTimeout(timer);
}
