// Pure FFT-spectrum analysis for the "Fear Frequency" (no audio/DOM code, easy to unit test).
// Input is an AnalyserNode dB spectrum; output says how far the 18.9 Hz band sticks out above
// the surrounding low-frequency noise floor.
import { INFRASOUND } from '../../config/app';

const DB_FLOOR = -140; // getFloatFrequencyData returns -Infinity for digital silence

const average = (values) => values.reduce((sum, value) => sum + value, 0) / (values.length || 1);

/**
 * @param {Float32Array} dbData   analyser.getFloatFrequencyData output (one value per bin)
 * @param {number} sampleRate     AudioContext sample rate
 * @returns {{bins:number[], binHz:number, peakDb:number, baselineDb:number, deltaDb:number, spiking:boolean}}
 */
export function analyzeSpectrum(dbData, sampleRate) {
  const { targetHz, bandHz, maxHz, minBaselineHz, spikeDeltaDb } = INFRASOUND;
  const binHz = sampleRate / (dbData.length * 2);
  const hzToBin = (hz) => Math.round(hz / binHz);

  const bins = Array.from(dbData.slice(0, hzToBin(maxHz) + 1), (db) => Math.max(DB_FLOOR, db));
  const bandStart = hzToBin(targetHz - bandHz);
  const bandEnd = hzToBin(targetHz + bandHz);

  const peakDb = Math.max(...bins.slice(bandStart, bandEnd + 1));
  const noise = bins.filter((_, index) => index >= hzToBin(minBaselineHz) && (index < bandStart || index > bandEnd));
  const baselineDb = average(noise);
  const deltaDb = Math.max(0, peakDb - baselineDb);

  return { bins, binHz, peakDb, baselineDb, deltaDb, spiking: deltaDb >= spikeDeltaDb };
}
