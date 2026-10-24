// Full-screen fairy-dust layer: ambient twinkles, a glittering pointer trail, and bursts on every
// tap/click. Other code can request bursts via utils/sparkle.js. Respects reduced-motion.
import { useEffect, useRef } from 'react';

// Glitter palettes per theme: bright dust glows on dark; deeper tones stay visible on light.
const PALETTES = {
  dark: ['#ffffff', '#a4d1ba', '#d8dcd2', '#c9b6f5', '#e6b8d0'],
  light: ['#4a6359', '#79958b', '#6b5b8a', '#a699c0', '#b99d6c'],
};
const isLight = () => document.documentElement.dataset.theme === 'light';
const MAX_PARTICLES = 260;
const TRAIL_STEP_PX = 14;

/** 4-point star centred on (x, y). */
function drawStar(ctx, x, y, radius) {
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const angle = (i * Math.PI) / 4;
    const r = i % 2 ? radius * 0.35 : radius;
    ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();
}

export default function SparkleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let particles = [];
    let width = 0;
    let height = 0;
    let frame;
    let lastTrail = { x: -99, y: -99 };

    const resize = () => {
      const ratio = devicePixelRatio || 1;
      width = innerWidth;
      height = innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const add = (x, y, spread, rise, decay) => {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      const colors = PALETTES[isLight() ? 'light' : 'dark'];
      particles.push({
        x, y, life: 1,
        vx: (Math.random() - 0.5) * spread,
        vy: (Math.random() - 0.5) * spread - rise,
        decay: decay * (0.6 + Math.random()),
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };
    const burst = (x, y, count) => {
      for (let i = 0; i < (calm ? count / 4 : count); i += 1) add(x, y, 9, 0, 0.02);
    };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      if (!calm && Math.random() < 0.25) add(Math.random() * width, Math.random() * height, 0.3, 0.15, 0.008);
      ctx.globalCompositeOperation = isLight() ? 'source-over' : 'lighter'; // additive glow only works on dark
      ctx.shadowBlur = 10;
      particles = particles.filter((p) => p.life > 0);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.life -= p.decay;
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        drawStar(ctx, p.x, p.y, p.size * (0.5 + p.life * 0.5));
      });
      frame = requestAnimationFrame(tick);
    };

    const onMove = ({ clientX, clientY }) => {
      if (Math.hypot(clientX - lastTrail.x, clientY - lastTrail.y) < TRAIL_STEP_PX) return;
      lastTrail = { x: clientX, y: clientY };
      add(clientX, clientY, 1.5, 0.2, 0.025);
    };
    const onDown = ({ clientX, clientY }) => burst(clientX, clientY, 22);
    const onBurst = ({ detail }) => burst(detail.x, detail.y, detail.count);

    resize();
    tick();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('sparkle:burst', onBurst);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('sparkle:burst', onBurst);
    };
  }, []);

  return <canvas ref={canvasRef} className="sparkle-canvas" aria-hidden="true" />;
}
