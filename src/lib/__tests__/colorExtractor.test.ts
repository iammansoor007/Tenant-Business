import { describe, it, expect } from 'vitest';
import {
  extractDominantColorFromImage,
  adjustHexTone,
  rgbToHex,
  hexToHsl,
  isValidHex,
} from '../colorExtractor';

describe('colorExtractor utility functions', () => {
  describe('isValidHex', () => {
    it('validates 6-character hex with hash', () => {
      expect(isValidHex('#123456')).toBe(true);
      expect(isValidHex('#abcdef')).toBe(true);
      expect(isValidHex('#ABCDEF')).toBe(true);
    });

    it('validates 3-character hex with hash', () => {
      expect(isValidHex('#fff')).toBe(true);
      expect(isValidHex('#000')).toBe(true);
      expect(isValidHex('#abc')).toBe(true);
    });

    it('rejects invalid hex strings', () => {
      expect(isValidHex('123456')).toBe(false);
      expect(isValidHex('#12345')).toBe(false);
      expect(isValidHex('#1234567')).toBe(false);
      expect(isValidHex('#gggggg')).toBe(false);
      expect(isValidHex('')).toBe(false);
      expect(isValidHex('blue')).toBe(false);
    });
  });

  describe('rgbToHex', () => {
    it('converts pure black RGB to hex', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
    });

    it('converts pure white RGB to hex', () => {
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    });

    it('converts standard colors', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
      expect(rgbToHex(15, 76, 129)).toBe('#0f4c81');
    });

    it('clamps out of bounds RGB values', () => {
      expect(rgbToHex(300, -20, 256)).toBe('#ff00ff');
    });
  });

  describe('hexToHsl', () => {
    it('converts pure black to HSL', () => {
      const hsl = hexToHsl('#000000');
      expect(hsl).toBe('0 0% 0%');
    });

    it('converts pure white to HSL', () => {
      const hsl = hexToHsl('#ffffff');
      expect(hsl).toBe('0 0% 100%');
    });

    it('converts primary blue to HSL', () => {
      const hsl = hexToHsl('#0047AB');
      expect(typeof hsl).toBe('string');
      const parts = hsl.split(' ');
      expect(parts.length).toBe(3);
    });

    it('handles 3-digit shorthand hex codes', () => {
      const hsl = hexToHsl('#fff');
      expect(hsl).toBe('0 0% 100%');
    });

    it('falls back gracefully on invalid hex', () => {
      const hsl = hexToHsl('invalid');
      expect(hsl).toBe('215 65% 15%');
    });
  });

  describe('adjustHexTone', () => {
    it('lightens a dark hex color', () => {
      const original = '#000000';
      const lighter = adjustHexTone(original, 40);
      expect(lighter).not.toBe(original);
      expect(lighter.startsWith('#')).toBe(true);
    });

    it('darkens a light hex color', () => {
      const original = '#ffffff';
      const darker = adjustHexTone(original, -40);
      expect(darker).not.toBe(original);
      expect(darker.startsWith('#')).toBe(true);
    });

    it('clamps at 255 and 0 without crashing', () => {
      expect(adjustHexTone('#ffffff', 100)).toBe('#ffffff');
      expect(adjustHexTone('#000000', -100)).toBe('#000000');
    });

    it('handles shorthand hex', () => {
      const adjusted = adjustHexTone('#333', 20);
      expect(adjusted.startsWith('#')).toBe(true);
    });
  });
});
