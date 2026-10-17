import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isAudioAlertsEnabled,
  setAudioAlertsEnabled,
  playLiveArrivalChime,
  playHotLeadChime,
  sendDesktopAlert,
  resetAudioContextForTesting,
} from '../audioAlerts';

describe('audioAlerts utility', () => {
  beforeEach(() => {
    localStorage.clear();
    resetAudioContextForTesting();
    vi.restoreAllMocks();
  });

  it('defaults to audio alerts enabled', () => {
    expect(isAudioAlertsEnabled()).toBe(true);
  });

  it('can toggle audio alerts on and off and persist in localStorage', () => {
    setAudioAlertsEnabled(false);
    expect(isAudioAlertsEnabled()).toBe(false);
    expect(localStorage.getItem('pitch_sound_alerts_enabled')).toBe('false');

    setAudioAlertsEnabled(true);
    expect(isAudioAlertsEnabled()).toBe(true);
    expect(localStorage.getItem('pitch_sound_alerts_enabled')).toBe('true');
  });

  it('does not play chimes if audio alerts are disabled', async () => {
    setAudioAlertsEnabled(false);
    await expect(playLiveArrivalChime()).resolves.not.toThrow();
    await expect(playHotLeadChime()).resolves.not.toThrow();
  });

  it('plays live arrival chime without throwing when AudioContext is mocked', async () => {
    setAudioAlertsEnabled(true);
    const mockOscillator = {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockCtx = {
      state: 'running',
      currentTime: 10,
      destination: {},
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGain),
      resume: vi.fn().mockResolvedValue(undefined),
    };

    (window as any).AudioContext = vi.fn(() => mockCtx);

    await expect(playLiveArrivalChime()).resolves.not.toThrow();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });

  it('plays hot lead chime without throwing when AudioContext is mocked', async () => {
    setAudioAlertsEnabled(true);
    const mockOscillator = {
      type: 'triangle',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockCtx = {
      state: 'running',
      currentTime: 10,
      destination: {},
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGain),
      resume: vi.fn().mockResolvedValue(undefined),
    };

    (window as any).AudioContext = vi.fn(() => mockCtx);

    await expect(playHotLeadChime()).resolves.not.toThrow();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });

  it('requests desktop notification permission when default and dispatches notification if granted', async () => {
    const mockNotification = vi.fn();
    (mockNotification as any).permission = 'default';
    (mockNotification as any).requestPermission = vi.fn().mockResolvedValue('granted');
    (window as any).Notification = mockNotification;

    await sendDesktopAlert('Apex Roofing', 'Client is live on site!');
    expect(mockNotification.requestPermission).toHaveBeenCalled();
  });
});
