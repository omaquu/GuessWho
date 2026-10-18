'use strict';

/**
 * generate_music.js
 * Generates an authentic "Who Wants to Be a Millionaire?" suspense soundtrack.
 * Outputs a 30-second seamless stereo 16-bit 44.1kHz WAV file.
 */

const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const durationSeconds = 30;
const totalSamples = sampleRate * durationSeconds;
const numChannels = 2; // Stereo

const leftChannel = new Float32Array(totalSamples);
const rightChannel = new Float32Array(totalSamples);

console.log('[MusicGen] Synthesizing 30-second suspense soundtrack...');

// ---------------------------------------------------------------------------
// 1. Deep Sub-Bass Pedal Drone (E1 ~ 41.2 Hz + B1 ~ 61.7 Hz)
// ---------------------------------------------------------------------------
const baseFreq = 41.203; // E1
for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;

  // Slow LFO filter / volume breathing (period = 10s)
  const lfo = 0.8 + 0.2 * Math.sin((2 * Math.PI * t) / 10);
  const detuneL = Math.sin(2 * Math.PI * (baseFreq - 0.2) * t);
  const detuneR = Math.sin(2 * Math.PI * (baseFreq + 0.2) * t);
  const fifth = 0.45 * Math.sin(2 * Math.PI * (baseFreq * 1.4983) * t);
  const octave = 0.25 * Math.sin(2 * Math.PI * (baseFreq * 2.001) * t);

  const subL = (detuneL + fifth + octave) * 0.28 * lfo;
  const subR = (detuneR + fifth + octave) * 0.28 * lfo;

  leftChannel[i] += subL;
  rightChannel[i] += subR;
}

// ---------------------------------------------------------------------------
// 2. Suspense Pad Chords (Em - Cmaj7 - Am9 - B7sus4)
// ---------------------------------------------------------------------------
const chordProgression = [
  { start: 0,  end: 8,  notes: [82.4, 123.5, 164.8, 196.0, 246.9] }, // Em (E2, B2, E3, G3, B3)
  { start: 8,  end: 16, notes: [65.4, 130.8, 164.8, 196.0, 246.9] }, // Cmaj7 (C2, C3, E3, G3, B3)
  { start: 16, end: 24, notes: [55.0, 110.0, 164.8, 196.0, 220.0] }, // Am7/9 (A1, A2, E3, G3, A3)
  { start: 24, end: 30, notes: [61.7, 123.5, 164.8, 185.0, 246.9] }, // Bsus4 (B1, B2, E3, F#3, B3)
];

chordProgression.forEach(({ start, end, notes }) => {
  const startSample = Math.floor(start * sampleRate);
  const endSample = Math.min(totalSamples, Math.floor(end * sampleRate));
  const chordLength = endSample - startSample;

  for (let i = startSample; i < endSample; i++) {
    const localT = (i - startSample) / sampleRate;
    const progress = (i - startSample) / chordLength;

    // Smooth envelope with attack and release
    let env = 1.0;
    if (progress < 0.15) env = Math.sin((progress / 0.15) * (Math.PI / 2));
    else if (progress > 0.85) env = Math.cos(((progress - 0.85) / 0.15) * (Math.PI / 2));

    let padL = 0;
    let padR = 0;

    notes.forEach((freq, idx) => {
      // Subtle chorusing via phase detuning
      const detune = (idx % 2 === 0 ? 0.35 : -0.35);
      const pan = (idx / notes.length) * 0.6 + 0.2; // Pan across stereo field
      const osc1 = Math.sin(2 * Math.PI * (freq + detune) * localT);
      const osc2 = 0.5 * Math.sin(2 * Math.PI * (freq * 2.002) * localT);
      const tone = (osc1 + osc2) * (0.045 / notes.length);

      padL += tone * (1 - pan);
      padR += tone * pan;
    });

    leftChannel[i] += padL * env;
    rightChannel[i] += padR * env;
  }
});

// ---------------------------------------------------------------------------
// 3. Millionaire Heartbeat ("lub-dub" at 60 BPM)
// ---------------------------------------------------------------------------
const bpm = 60;
const beatInterval = 60 / bpm; // 1.0s

for (let beat = 0; beat < durationSeconds; beat += beatInterval) {
  // Lub pulse (t=0)
  addHeartbeatPulse(beat, 0.42, 85, 42, 0.22);
  // Dub pulse (t=0.28s)
  addHeartbeatPulse(beat + 0.28, 0.32, 75, 36, 0.18);
}

function addHeartbeatPulse(timeInSec, peakVol, startHz, endHz, durationSec) {
  const startSample = Math.floor(timeInSec * sampleRate);
  const pulseSamples = Math.floor(durationSec * sampleRate);

  for (let s = 0; s < pulseSamples; s++) {
    const idx = (startSample + s) % totalSamples;
    const progress = s / pulseSamples;
    const currentFreq = startHz + (endHz - startHz) * Math.pow(progress, 0.6);
    const env = Math.sin(progress * Math.PI) * Math.exp(-progress * 3.5);
    const osc = Math.sin(2 * Math.PI * currentFreq * (s / sampleRate));

    const sampleVal = osc * env * peakVol;
    // Slight stereo width
    leftChannel[idx] += sampleVal * 0.95;
    rightChannel[idx] += sampleVal * 1.05;
  }
}

// ---------------------------------------------------------------------------
// 4. Metallic Clock Tick (Every Second)
// ---------------------------------------------------------------------------
for (let sec = 0; sec < durationSeconds; sec++) {
  const startSample = Math.floor(sec * sampleRate);
  const tickDuration = Math.floor(0.045 * sampleRate); // 45ms

  for (let s = 0; s < tickDuration; s++) {
    const idx = (startSample + s) % totalSamples;
    const progress = s / tickDuration;
    const env = Math.exp(-progress * 22.0);

    // High frequency metallic click (2500 Hz + 4200 Hz + noise)
    const t = s / sampleRate;
    const clickTone = Math.sin(2 * Math.PI * 2600 * t) * 0.5 + Math.sin(2 * Math.PI * 4350 * t) * 0.3;
    const noise = (Math.random() * 2 - 1) * 0.2;
    const tick = (clickTone + noise) * env * 0.18;

    // Pan tick slightly right-center
    leftChannel[idx] += tick * 0.7;
    rightChannel[idx] += tick * 1.0;
  }
}

// ---------------------------------------------------------------------------
// 5. Final Tension Swell (last 6 seconds towards lock-in)
// ---------------------------------------------------------------------------
const swellStart = Math.floor((durationSeconds - 6) * sampleRate);
for (let i = swellStart; i < totalSamples; i++) {
  const progress = (i - swellStart) / (totalSamples - swellStart);
  const t = i / sampleRate;
  const riserFreq = 160 + 340 * Math.pow(progress, 2); // Rises from 160Hz to 500Hz
  const swellTone = Math.sin(2 * Math.PI * riserFreq * t) * 0.08 * progress;

  leftChannel[i] += swellTone;
  rightChannel[i] += swellTone;
}

// ---------------------------------------------------------------------------
// 6. Seamless Loop Boundary Smoothing & Normalization
// ---------------------------------------------------------------------------
// Crossfade the first and last 20ms to guarantee zero clicks on loop
const crossfadeSamples = Math.floor(0.03 * sampleRate);
for (let i = 0; i < crossfadeSamples; i++) {
  const w = i / crossfadeSamples;
  const startIdx = i;
  const endIdx = totalSamples - crossfadeSamples + i;

  const blendL = leftChannel[startIdx] * w + leftChannel[endIdx] * (1 - w);
  const blendR = rightChannel[startIdx] * w + rightChannel[endIdx] * (1 - w);

  leftChannel[startIdx] = blendL;
  rightChannel[startIdx] = blendR;
  leftChannel[endIdx] = blendL;
  rightChannel[endIdx] = blendR;
}

// Find peak and normalize to -1.5 dB (0.85 max amplitude)
let peak = 0;
for (let i = 0; i < totalSamples; i++) {
  peak = Math.max(peak, Math.abs(leftChannel[i]), Math.abs(rightChannel[i]));
}
const normFactor = peak > 0 ? 0.85 / peak : 1.0;

// ---------------------------------------------------------------------------
// 7. Write 16-bit Stereo PCM WAV File
// ---------------------------------------------------------------------------
const bytesPerSample = 2; // 16-bit
const blockAlign = numChannels * bytesPerSample;
const dataSize = totalSamples * blockAlign;
const buffer = Buffer.alloc(44 + dataSize);

// RIFF header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);

// fmt subchunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);             // Subchunk1Size (16 for PCM)
buffer.writeUInt16LE(1, 20);              // AudioFormat (1 = PCM)
buffer.writeUInt16LE(numChannels, 22);    // NumChannels (2)
buffer.writeUInt32LE(sampleRate, 24);     // SampleRate (44100)
buffer.writeUInt32LE(sampleRate * blockAlign, 28); // ByteRate
buffer.writeUInt16LE(blockAlign, 32);     // BlockAlign (4)
buffer.writeUInt16LE(16, 34);             // BitsPerSample (16)

// data subchunk
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

let offset = 44;
for (let i = 0; i < totalSamples; i++) {
  const sL = Math.max(-1, Math.min(1, leftChannel[i] * normFactor));
  const sR = Math.max(-1, Math.min(1, rightChannel[i] * normFactor));

  const intL = sL < 0 ? Math.round(sL * 32768) : Math.round(sL * 32767);
  const intR = sR < 0 ? Math.round(sR * 32768) : Math.round(sR * 32767);

  buffer.writeInt16LE(intL, offset);
  buffer.writeInt16LE(intR, offset + 2);
  offset += 4;
}

const outputPath = path.join(__dirname, '..', 'public', 'assets', 'suspense.wav');
fs.writeFileSync(outputPath, buffer);
console.log(`[MusicGen] Successfully created: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
