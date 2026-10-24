// SerpAPI connector — "the ancient tomes".
// Researches an identified species on Google via SerpAPI and returns a short summary,
// trusted source links and (when available) reference images.
import { CONFIG, isConfigured } from '../../config/env';
import { http } from '../_shared/http';
import { withFallback } from '../_shared/withFallback';
import { lookupMock } from './mock';

async function lookupWithSerpApi({ name, scientificName }) {
  const result = await http.get(`${CONFIG.serpapi.baseUrl}/search.json`, {
    query: { engine: 'google', q: `${name} ${scientificName} toxicity symptoms`, num: 5, api_key: CONFIG.serpapi.apiKey },
  });
  const organic = result.organic_results || [];
  return {
    summary: result.knowledge_graph?.description || result.answer_box?.snippet || organic[0]?.snippet || '',
    sources: organic.slice(0, 3).map(({ title, link }) => ({ title, link })),
    images: (result.inline_images || []).slice(0, 4).map((image) => image.thumbnail),
  };
}

/** lookupSpecies({ name, scientificName }) -> { summary, sources: [{title, link}], images: [url] } */
export const lookupSpecies = withFallback('serpapi', () => isConfigured(CONFIG.serpapi.apiKey), lookupWithSerpApi, lookupMock);
