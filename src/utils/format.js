// Small formatting helpers shared by the UI.
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** "5 min ago", "3 h ago", "2 d ago". */
export function timeAgo(timestamp) {
  const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 48 ? `${hours} h ago` : `${Math.round(hours / 24)} d ago`;
}
