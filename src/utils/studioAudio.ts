// Studio-grade acoustic soundboard and audio chime synthesizers for authentic dispatch experience

class StudioDispatchAudio {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!this.audioCtx || this.audioCtx.state === 'suspended') {
      this.audioCtx = new AudioContextClass();
    }
    return this.audioCtx;
  }

  /**
   * Warm Studio Dispatch Chime (Acoustic 3-tone arpeggio)
   */
  public playChime(): Promise<void> {
    return new Promise((resolve) => {
      const ctx = this.getContext();
      if (!ctx) {
        resolve();
        return;
      }

      try {
        const now = ctx.currentTime;
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.001, now);
        master.gain.linearRampToValueAtTime(0.08, now + 0.03);
        master.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        master.connect(ctx.destination);

        // Chimes: E5 -> G#5 -> B5 (Bright uplifting triad)
        const notes = [659.25, 830.61, 987.77];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          const startTime = now + i * 0.08;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          noteGain.gain.setValueAtTime(0.001, startTime);
          noteGain.gain.linearRampToValueAtTime(0.7, startTime + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

          osc.connect(noteGain);
          noteGain.connect(master);

          osc.start(startTime);
          osc.stop(startTime + 0.36);
        });

        setTimeout(resolve, 380);
      } catch (e) {
        resolve();
      }
    });
  }

  /**
   * Radio Mic Beep (Short walkie-talkie chirp for authentic moto dispatch)
   */
  public playRadioBeep(): Promise<void> {
    return new Promise((resolve) => {
      const ctx = this.getContext();
      if (!ctx) {
        resolve();
        return;
      }

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1760, now); // A6
        osc.frequency.setValueAtTime(2637, now + 0.04); // E7

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);

        setTimeout(resolve, 100);
      } catch (e) {
        resolve();
      }
    });
  }

  /**
   * Success Confirmation Ping
   */
  public playSuccessPing(): Promise<void> {
    return new Promise((resolve) => {
      const ctx = this.getContext();
      if (!ctx) {
        resolve();
        return;
      }

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);

        setTimeout(resolve, 300);
      } catch (e) {
        resolve();
      }
    });
  }
}

export const studioAudio = new StudioDispatchAudio();
