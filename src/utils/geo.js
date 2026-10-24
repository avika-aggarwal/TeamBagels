// Geographic helpers: great-circle distance, distance formatting and map projection.
const KM_PER_DEG_LAT = 110.57;
const KM_PER_DEG_LNG = 111.32;
const toRad = (deg) => (deg * Math.PI) / 180;

/** Haversine distance in km between two {lat, lng} points. */
export function distanceKm(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return km < 100 ? `${km.toFixed(1)} km` : `${Math.round(km).toLocaleString()} km`;
}

/** Projects `point` onto a unit disc around `center` (x right, y down; |(x,y)| = 1 at radiusKm). */
export function projectToUnit(center, point, radiusKm) {
  const dx = (point.lng - center.lng) * Math.cos(toRad(center.lat)) * KM_PER_DEG_LNG;
  const dy = (point.lat - center.lat) * KM_PER_DEG_LAT;
  return { x: dx / radiusKm, y: -dy / radiusKm };
}

/** Returns a point `northKm` / `eastKm` away from `center`. */
export const offsetCoords = (center, northKm, eastKm) => ({
  lat: center.lat + northKm / KM_PER_DEG_LAT,
  lng: center.lng + eastKm / (KM_PER_DEG_LNG * Math.cos(toRad(center.lat))),
});
