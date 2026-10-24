// Camera connector — LIVE capture only.
// Anti-fake policy: there is deliberately NO file-upload path anywhere in the app. Every photo
// is drawn from the live <video> stream and stamped with a "proof" (time, GPS, SHA-256) that a
// backend can re-check. Demo frames (no camera) are flagged `live: false` and can't be verified.
import { CONFIG } from '../../config/env';

const MAX_WIDTH = 720;

export async function openCamera() {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera requires HTTPS or localhost');
  return navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false });
}

export const stopCamera = (stream) => stream?.getTracks().forEach((track) => track.stop());

async function sha256(text) {
  if (!crypto.subtle) return null;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Packages a canvas into { id, dataUrl, proof } — the shape the scan pipeline expects. */
async function packageFrame(canvas, coords, live) {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
  return { id: Date.now(), dataUrl, proof: { live, capturedAt: Date.now(), coords, hash: await sha256(dataUrl) } };
}

/** Grabs the current video frame (downscaled to keep storage small). */
export function captureLivePhoto(video, coords) {
  const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth * scale;
  canvas.height = video.videoHeight * scale;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  return packageFrame(canvas, coords, true);
}

/** Clearly-fake enchanted frame for machines without a camera (only if allowed in config). */
export function captureDemoFrame(coords) {
  if (!CONFIG.allowDemoCapture) throw new Error('Demo capture disabled');
  const canvas = document.createElement('canvas');
  canvas.width = 540;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, 720);
  sky.addColorStop(0, '#2a3a96');
  sky.addColorStop(1, '#0e1545');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 540, 720);
  ctx.font = '260px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🍄', 270, 440);
  ctx.font = '28px sans-serif';
  ctx.fillStyle = '#ffd98a';
  ctx.fillText('demo vision — unverifiable', 270, 640);
  return packageFrame(canvas, coords, false);
}
