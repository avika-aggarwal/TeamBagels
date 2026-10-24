// Offline stand-in for Muse: one in-character template per event, plus a canned transcript.
const TEMPLATES = {
  infrasound_spike: ({ deltaDb }) =>
    `The ambient infrasound just spiked ${Math.round(deltaDb)} dB near the fear frequency. Stay alert — you're entering a highly active zone.`,
  scan_result: ({ name, hazard }) =>
    hazard >= 3
      ? `Careful, traveller. That ${name} brews a ${hazard >= 5 ? 'draught of doom' : 'bitter draught'}. Keep your hands in your pockets and warn the others.`
      : `A gentle find! ${name} is little danger to a wanderer — but a true alchemist still washes their hands.`,
  poison_alert: ({ title, distanceKm }) =>
    `A potion peril was just pinned ${distanceKm.toFixed(1)} km from you: ${title}. Watch your step, and keep pets close.`,
  verification_request: ({ expertName, title, distanceKm }) =>
    `Hey ${expertName}, a wanderer just pinned a possible ${title} about ${distanceKm.toFixed(1)} km from your trail. Could you verify this sighting?`,
  profile_bio: ({ name, rank, stats }) =>
    `${name}, ${rank} of the Wanderlust Guild — ${stats.scanned} plants scanned, ${stats.helped} wanderers warned, and a cauldron that never boils over.`,
  investigator_reply: ({ question }) =>
    `I heard you say "${question}". The veil is thin here — keep listening to the low hum, and tell me when it changes.`,
};

export async function narrateMock(event, context) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return TEMPLATES[event](context);
}

export async function transcribeMock() {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return 'is somebody there';
}
