// Sighting categories: one place that defines label, icon and glow colour for the whole UI.
// Colours are mid-tones so they stay readable in both dark and light mode.
export const CATEGORIES = {
  wonder: { label: 'Natural Wonders', emoji: '🌈', color: '#3fa7c4' },
  ghost: { label: 'Haunted Places', emoji: '👻', color: '#8b74d6' },
  sound: { label: 'Rare Sounds', emoji: '🔔', color: '#c9962b' },
  flora: { label: 'Potion Plants', emoji: '🍄', color: '#3fae83' },
  fauna: { label: 'Creatures', emoji: '🦇', color: '#d46aa6' },
};

export const CATEGORY_IDS = Object.keys(CATEGORIES);

/** A sighting's own emoji, or its category's default. */
export const sightingEmoji = (sighting) => sighting.emoji || CATEGORIES[sighting.category].emoji;
