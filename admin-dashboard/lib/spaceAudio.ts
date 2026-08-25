'use client';

// Web Audio API Synthesizer for Space Ambient & Action Sounds in Admin Panel
class AdminSpaceAudio {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private isAmbientPlaying: boolean = false;
  private isMuted: boolean = false;

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Start continuous space ambient drone loop
  public startSpaceAmbient() {
    if (this.isMuted || this.isAmbientPlaying) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.035, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, ctx.currentTime);

      this.osc1 = ctx.createOscillator();
      this.osc2 = ctx.createOscillator();

      this.osc1.type = 'sine';
      this.osc1.frequency.setValueAtTime(55, ctx.currentTime); // Sub-bass A1

      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(110.3, ctx.currentTime); // Detuned A2

      this.osc1.connect(filter);
      this.osc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(ctx.destination);

      this.osc1.start();
      this.osc2.start();
      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn('Space audio init prevented:', e);
    }
  }

  public stopSpaceAmbient() {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
      setTimeout(() => {
        if (this.osc1) { try { this.osc1.stop(); } catch(e){} }
        if (this.osc2) { try { this.osc2.stop(); } catch(e){} }
        this.isAmbientPlaying = false;
      }, 300);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopSpaceAmbient();
    } else {
      this.startSpaceAmbient();
    }
    return this.isMuted;
  }

  public playClick() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  public playHover() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);

    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  }

  public playNodePing() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playActionWarp() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.15);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }
}

export const spaceAudio = new AdminSpaceAudio();
