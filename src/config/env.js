// Single source of truth for every API endpoint, key and tunable.
// Values come from `.env` (see .env.example). Anything that still starts with
// "YOUR_" is treated as "not configured yet" and its connector uses a mock instead.
const env = import.meta.env;

/** Reads VITE_<NAME>, falling back to an explicit default or a YOUR_<NAME> placeholder. */
const read = (name, fallback) => env[`VITE_${name}`] || fallback || `YOUR_${name}`;

/** True once a placeholder has been replaced with a real value. */
export const isConfigured = (value) => Boolean(value) && !String(value).startsWith('YOUR_');

export const CONFIG = {
  // Wanderlust's own backend. Unset => sightings live in localStorage.
  api: {
    baseUrl: read('API_BASE_URL'),
    alertsWsUrl: read('ALERTS_WS_URL'),
  },
  // Google Gemini: identifies the photographed plant/creature and flags synthetic images.
  gemini: {
    apiKey: read('GEMINI_API_KEY'),
    baseUrl: read('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
    model: read('GEMINI_MODEL', 'gemini-2.5-flash'),
  },
  // SerpAPI: web research on the identified species (routed via the Vite proxy in dev).
  serpapi: {
    apiKey: read('SERPAPI_API_KEY'),
    baseUrl: read('SERPAPI_BASE_URL', '/proxy/serpapi'),
  },
  // Meta Muse: the Paranormal Investigator agent and Voice Transcribe.
  muse: {
    apiKey: read('MUSE_API_KEY'),
    agentUrl: read('MUSE_AGENT_URL'),
    transcribeUrl: read('MUSE_TRANSCRIBE_URL'),
  },
  // Facebook Graph API: place lookup and nearby community-verified experts.
  facebook: {
    accessToken: read('FACEBOOK_ACCESS_TOKEN'),
    baseUrl: read('FACEBOOK_BASE_URL', 'https://graph.facebook.com/v19.0'),
    nearbyExpertsPath: read('FACEBOOK_NEARBY_EXPERTS_PATH'),
  },
  // Optional Python (scipy/librosa) service that double-checks infrasound spikes.
  infrasound: {
    backendUrl: read('INFRASOUND_BACKEND_URL'),
  },
  // When no camera exists (desktop dev), allow a clearly-flagged, unverifiable demo frame.
  allowDemoCapture: env.VITE_ALLOW_DEMO_CAPTURE !== 'false',
};
