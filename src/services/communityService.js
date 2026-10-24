// Community service: finds nearby knowledgeable people and brokers verification requests.
// The Facebook Graph connector finds the people; Muse writes the friendly ping to them.
import { findNearbyExperts, requestVerification } from '../connectors/facebookGraph';
import { narrate } from '../connectors/muse';

export const listNearbyPeople = (coords, topic) => findNearbyExperts({ coords, topic });

/**
 * Asks the nearest verifiers to confirm a sighting.
 * Resolves with { verifiers, message } where `message` is Muse's note to the first expert.
 */
export async function askVerifiers(sighting) {
  const verifiers = (await findNearbyExperts({ coords: sighting.coords, topic: sighting.category })).slice(0, 3);
  await Promise.all(verifiers.map((expert) => requestVerification({ sighting, expert })));
  const first = verifiers[0];
  const message = first
    ? await narrate('verification_request', { expertName: first.name.split(' ')[0], title: sighting.title, distanceKm: first.distanceKm })
    : null;
  return { verifiers, message };
}
