/**
 * Web Audio API Ambient Space Synthesizer for cockpit immersion
 */

class SpaceSynthesizer {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  public init(): boolean {
    if (this.ctx) return true;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      return true;
    } catch {
      return false;
    }
  }

  public start(): boolean {
    if (!this.ctx) {
      const ok = this.init();
      if (!ok || !this.ctx) return false;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isRunning) return true;

    try {
      const now = this.ctx.currentTime;

      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.08, now + 1.2);
      this.masterGain.connect(this.ctx.destination);

      // Lowpass resonant filter for cockpit atmosphere
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(260, now);
      this.filter.Q.setValueAtTime(2.5, now);
      this.filter.connect(this.masterGain);

      // LFO for slow atmospheric breathing
      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.12, now); // 0.12 Hz cycle
      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(60, now);
      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.filter.frequency);
      this.lfo.start();

      // Osc 1: Sub drone (55Hz / A1)
      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = 'sine';
      this.subOsc.frequency.setValueAtTime(55, now);
      this.subOsc.connect(this.filter);
      this.subOsc.start();

      // Osc 2: Harmonic warm drone (110Hz / A2)
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'triangle';
      this.osc1.frequency.setValueAtTime(110, now);
      this.osc1.connect(this.filter);
      this.osc1.start();

      // Osc 3: Detuned celestial fifth (164.8Hz / E3)
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'sine';
      this.osc2.frequency.setValueAtTime(164.81, now);
      this.osc2.connect(this.filter);
      this.osc2.start();

      this.isRunning = true;
      return true;
    } catch {
      return false;
    }
  }

  public stop(): void {
    if (!this.ctx || !this.isRunning) return;

    try {
      const now = this.ctx.currentTime;
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      }

      setTimeout(() => {
        try {
          this.subOsc?.stop();
          this.osc1?.stop();
          this.osc2?.stop();
          this.lfo?.stop();
          this.subOsc?.disconnect();
          this.osc1?.disconnect();
          this.osc2?.disconnect();
          this.lfo?.disconnect();
          this.lfoGain?.disconnect();
          this.filter?.disconnect();
          this.masterGain?.disconnect();
        } catch {
          // ignore
        }
        this.isRunning = false;
      }, 550);
    } catch {
      this.isRunning = false;
    }
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }

  public getStatus(): boolean {
    return this.isRunning;
  }
}

export const spaceSynth = new SpaceSynthesizer();
