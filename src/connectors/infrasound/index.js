// Infrasound connector — listens for the 18.9 Hz "Fear Frequency".
// Muse can't hear infrasound itself, so we run the FFT locally (Web Audio AnalyserNode),
// and only when the band spikes do we trigger Muse (see GhostScreen). Phone mics often
// high-pass filter this range, so `injectTone` feeds a synthetic 18.9 Hz tone into the SAME
// analyser for demos/tests — the detection path is identical to real microphone input.
import { CONFIG, isConfigured } from '../../config/env';
import { INFRASOUND } from '../../config/app';
import { http } from '../_shared/http';
import { analyzeSpectrum } from './analyzer';

const FRAME_MS = 50;

/**
 * Starts listening. Calls `onFrame(analysis)` ~20x/second.
 * Resolves with { stop, injectTone(ms), micAvailable }; falls back to tone-only if the mic is denied.
 */
export async function startListening(onFrame) {
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = 32768; // ~1.5 Hz bins at 48 kHz — enough resolution to isolate 18.9 Hz
  analyser.smoothingTimeConstant = 0.8;

  let stream = null;
  try {
    // Disable voice processing: it would filter out exactly the frequencies we want.
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    context.createMediaStreamSource(stream).connect(analyser);
  } catch (error) {
    console.warn('[infrasound] microphone unavailable, tone-only mode', error);
  }

  const dbData = new Float32Array(analyser.frequencyBinCount);
  const timer = setInterval(() => {
    analyser.getFloatFrequencyData(dbData);
    onFrame(analyzeSpectrum(dbData, context.sampleRate));
  }, FRAME_MS);

  return {
    micAvailable: Boolean(stream),
    injectTone(ms = 3000) {
      const oscillator = context.createOscillator();
      oscillator.frequency.value = INFRASOUND.targetHz;
      oscillator.connect(analyser); // analyser only — never routed to the speakers
      oscillator.start();
      oscillator.stop(context.currentTime + ms / 1000);
    },
    stop() {
      clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
      context.close();
    },
  };
}

/** Optionally forwards a spike to the Python (scipy/librosa) service for a second opinion. */
export async function reportSpike(payload) {
  if (!isConfigured(CONFIG.infrasound.backendUrl)) return;
  try {
    await http.post(CONFIG.infrasound.backendUrl, payload);
  } catch (error) {
    console.warn('[infrasound] backend report failed', error);
  }
}
