// Scan service: the identification pipeline behind the Scan screen.
//   1. Gemini identifies the photo + checks it isn't synthetic
//   2. SerpAPI researches the species
//   3. Muse narrates the result in character
// `onStep(i)` lets the UI show progress using SCAN_STEPS labels.
import { identifyImage } from '../connectors/gemini';
import { narrate } from '../connectors/muse';
import { lookupSpecies } from '../connectors/serpapi';

export const SCAN_STEPS = ['Consulting the mirror…', 'Searching the ancient tomes…', 'Summoning the Investigator…'];

export async function scanPhoto(photo, onStep = () => {}) {
  onStep(0);
  const identity = await identifyImage(photo, { coords: photo.proof.coords });

  onStep(1);
  const research = await lookupSpecies(identity);

  onStep(2);
  const narration = await narrate('scan_result', { name: identity.name, hazard: identity.hazard });

  // Only a live camera frame that Gemini also believes is natural counts as authentic.
  const authentic = photo.proof.live && !identity.looksSynthetic;
  return { ...identity, research, narration, authentic };
}
