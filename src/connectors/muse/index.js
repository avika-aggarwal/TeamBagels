// Muse connector — the "Paranormal Investigator" voice.
//  narrate(event, context) : Muse Agent turns an app event into an in-character line.
//  transcribe(audioBlob)   : Muse Voice Transcribe turns recorded audio into text.
//  speak(text)             : plays a line through the device speakers/headphones.
import { CONFIG, isConfigured } from '../../config/env';
import { http } from '../_shared/http';
import { withFallback } from '../_shared/withFallback';
import { narrateMock, transcribeMock } from './mock';

const authHeaders = { Authorization: `Bearer ${CONFIG.muse.apiKey}` };

/** Events: infrasound_spike | scan_result | poison_alert | verification_request | profile_bio | investigator_reply */
export const narrate = withFallback(
  'muse-agent',
  () => isConfigured(CONFIG.muse.agentUrl),
  async (event, context) => (await http.post(CONFIG.muse.agentUrl, { event, context }, { headers: authHeaders })).message,
  narrateMock,
);

export const transcribe = withFallback(
  'muse-transcribe',
  () => isConfigured(CONFIG.muse.transcribeUrl),
  async (audioBlob) => {
    const form = new FormData();
    form.append('audio', audioBlob, 'clip.webm');
    return (await http.post(CONFIG.muse.transcribeUrl, form, { headers: authHeaders })).text;
  },
  transcribeMock,
);

export function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 0.8;
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

/** Records `ms` of microphone audio and resolves with a Blob (input for `transcribe`). */
export async function recordClip(ms = 4000) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks = [];
  recorder.ondataavailable = (event) => chunks.push(event.data);
  const finished = new Promise((resolve) => {
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      resolve(new Blob(chunks, { type: recorder.mimeType }));
    };
  });
  recorder.start();
  setTimeout(() => recorder.stop(), ms);
  return finished;
}
