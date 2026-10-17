// Web Audio API Synthesizer & Browser Push Alerts for Live Prospect Tracking

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function resetAudioContextForTesting(): void {
  audioCtx = null;
}

// Global user-gesture audio auto-unlock to comply with modern browser autoplay policies
if (typeof window !== 'undefined') {
  const unlockAudioContext = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {}
  };
  window.addEventListener('pointerdown', unlockAudioContext, { passive: true });
  window.addEventListener('keydown', unlockAudioContext, { passive: true });
}

async function ensureAudioReady(): Promise<AudioContext | null> {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function isAudioAlertsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const val = localStorage.getItem('pitch_sound_alerts_enabled');
  return val === null ? true : val === 'true';
}

export function setAudioAlertsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('pitch_sound_alerts_enabled', String(enabled));
}

/**
 * Play a subtle, premium radar chime when a prospect enters the pitch
 */
export async function playLiveArrivalChime() {
  if (!isAudioAlertsEnabled()) return;
  const ctx = await ensureAudioReady();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.12, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);

    // Tone 2: 880 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.15, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.61);
  } catch {}
}

/**
 * Play an urgent high-intent lead chime (when lead score reaches HOT or phone is tapped)
 */
export async function playHotLeadChime() {
  if (!isAudioAlertsEnabled()) return;
  const ctx = await ensureAudioReady();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const startTime = now + (idx * 0.08);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.14, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.46);
    });
  } catch {}
}

/**
 * Request notification permissions and show native desktop notification
 */
export async function sendDesktopAlert(clientName: string, message: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  try {
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    if (Notification.permission === 'granted') {
      new Notification(`🔥 Prospect Live: ${clientName}`, {
        body: message,
        icon: '/favicon.ico',
        tag: `prospect_${clientName}`,
      });
    }
  } catch {}
}
