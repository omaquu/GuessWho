'use strict';

/**
 * audio.js — Sound and Music Controller for Miljonääripeli
 * Supports both WAV playback and real-time Web Audio API sound effects.
 */

class AudioManager {
  constructor() {
    this.musicAudio = new Audio('assets/suspense.wav');
    this.musicAudio.loop = true;
    this.musicAudio.preload = 'auto';

    this.isMuted = false;
    this.volume = 0.4;
    this.ctx = null;
    this.isInitialized = false;

    // Load saved preferences
    const savedVol = localStorage.getItem('mp_volume');
    const savedMute = localStorage.getItem('mp_muted');
    if (savedVol !== null) this.volume = parseFloat(savedVol);
    if (savedMute !== null) this.isMuted = savedMute === 'true';

    this.applyVolume();
  }

  initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.isInitialized = true;
      }
    } catch (e) {
      console.warn('[Audio] Could not create AudioContext:', e.message);
    }
  }

  unlock() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    localStorage.setItem('mp_volume', this.volume);
    this.applyVolume();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('mp_muted', this.isMuted);
    this.applyVolume();
    return this.isMuted;
  }

  applyVolume() {
    const effective = this.isMuted ? 0 : this.volume;
    this.musicAudio.volume = effective;
  }

  playSuspenseMusic() {
    this.unlock();
    this.applyVolume();
    this.musicAudio.currentTime = 0;
    const promise = this.musicAudio.play();
    if (promise !== undefined) {
      promise.catch(err => {
        console.log('[Audio] Autoplay blocked, waiting for click:', err.message);
      });
    }
  }

  stopSuspenseMusic() {
    this.musicAudio.pause();
    this.musicAudio.currentTime = 0;
  }

  // ---------------------------------------------------------------------------
  // Web Audio Procedural Sound Effects
  // ---------------------------------------------------------------------------

  playCorrectSound() {
    this.unlock();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord (C4, E4, G4, C5)

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0, t + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.22 * this.volume, t + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 1.3);
    });
  }

  playWrongSound() {
    this.unlock();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    // Dramatic descending dissonance (Millionaire wrong answer hit)
    const freqs = [155.56, 146.83, 110.00]; // Eb3, D3, A2

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.75, t + 1.2);

      // Lowpass filter for deep brassy impact
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t);
      filter.frequency.exponentialRampToValueAtTime(120, t + 1.2);

      gain.gain.setValueAtTime(0.28 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 1.4);
    });
  }

  playLifelineSound() {
    this.unlock();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    // Mystical ascending shimmer
    const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51];

    arpeggio.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);

      gain.gain.setValueAtTime(0, t + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.18 * this.volume, t + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.55);
    });
  }

  playGongSound() {
    this.unlock();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 1.5);

    gain.gain.setValueAtTime(0.3 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 1.7);
  }
}

// Global singleton instance
window.audioManager = new AudioManager();
