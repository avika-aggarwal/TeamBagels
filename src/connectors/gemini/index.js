// Gemini connector — "the Mirror's eyes".
// Sends the live photo to Gemini and gets back structured JSON: what it is, how dangerous it
// is, look-alikes, and whether the image looks AI-generated / a re-photographed screen.
import { CONFIG, isConfigured } from '../../config/env';
import { CATEGORIES } from '../../config/categories';
import { clamp } from '../../utils/format';
import { http } from '../_shared/http';
import { withFallback } from '../_shared/withFallback';
import { identifyMock } from './mock';

const PROMPT = `You are the Wanderlust Mirror, a careful field naturalist. Identify the main subject of this photo.
Reply with JSON only, shaped exactly like:
{"name": string, "scientificName": string, "category": "flora"|"fauna"|"wonder"|"ghost"|"sound",
 "hazard": 0-5 (0 harmless, 5 deadly), "confidence": 0-1, "summary": string, "dangers": string,
 "lookalikes": string[], "looksSynthetic": boolean, "authenticityNote": string}
"looksSynthetic" must be true if the image seems AI-generated, edited, or a photo of a screen.`;

async function identifyWithGemini(photo, { coords } = {}) {
  const [meta, data] = photo.dataUrl.split(',');
  const mimeType = meta.match(/data:(.*?);/)[1];
  const location = coords ? `\nPhoto taken near lat ${coords.lat.toFixed(3)}, lng ${coords.lng.toFixed(3)}.` : '';

  const result = await http.post(
    `${CONFIG.gemini.baseUrl}/models/${CONFIG.gemini.model}:generateContent`,
    {
      contents: [{ parts: [{ text: PROMPT + location }, { inline_data: { mime_type: mimeType, data } }] }],
      generationConfig: { responseMimeType: 'application/json' },
    },
    { headers: { 'x-goog-api-key': CONFIG.gemini.apiKey }, timeoutMs: 30000 },
  );

  const parsed = JSON.parse(result.candidates[0].content.parts[0].text);
  return {
    emoji: '🔮',
    lookalikes: [],
    ...parsed,
    category: CATEGORIES[parsed.category] ? parsed.category : 'flora',
    hazard: clamp(Number(parsed.hazard) || 0, 0, 5),
  };
}

/** identifyImage(photo, { coords }) -> identity object (see mock.js for a full example). */
export const identifyImage = withFallback('gemini', () => isConfigured(CONFIG.gemini.apiKey), identifyWithGemini, identifyMock);
