// Location connector — wraps the browser Geolocation API.
// Resolves with the device position, or the default centre (flagged `approximate`) if denied/unavailable.
import { DEFAULT_CENTER } from '../../config/app';

export function getCurrentPosition(timeout = 8000) {
  const fallback = { coords: DEFAULT_CENTER, approximate: true };
  if (!navigator.geolocation) return Promise.resolve(fallback);
  return new Promise((resolve) =>
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ coords: { lat: coords.latitude, lng: coords.longitude }, approximate: false }),
      () => resolve(fallback),
      { enableHighAccuracy: true, timeout },
    ),
  );
}
