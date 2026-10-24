// Tiny event bridge so any component can trigger fairy-dust without touching the canvas.
// SparkleCanvas (components/SparkleCanvas.jsx) listens for "sparkle:burst".
export const burstAt = (x, y, count = 40) =>
  window.dispatchEvent(new CustomEvent('sparkle:burst', { detail: { x, y, count } }));

/** Fireworks of glitter across the screen — used for wins (verified sighting, posted, level up). */
export function celebrate() {
  for (let i = 0; i < 6; i += 1) {
    setTimeout(() => burstAt(Math.random() * innerWidth, Math.random() * innerHeight * 0.7 + 40, 55), i * 140);
  }
}
