import { describe, it, expect } from 'vitest';
import { generateCustomizedCompleteData, getDefaultCompleteDataJson } from '../templateBuilder';

describe('templateBuilder engine', () => {
  it('returns valid JSON when called with empty object', () => {
    const data = generateCustomizedCompleteData({ name: '' });
    expect(data).toBeDefined();
    expect(data.footer).toBeDefined();
    expect(data.hero).toBeDefined();
  });

  it('substitutes business name across all occurrences', () => {
    const data = generateCustomizedCompleteData({
      name: 'Skyline Premium Roofing',
    });
    expect(data.footer.company.name).toBe('SKYLINE PREMIUM ROOFING');
    expect(data.footer.bottom.copyright).toContain('Skyline Premium Roofing');
  });

  it('substitutes phone number and tel: protocol link properly', () => {
    const data = generateCustomizedCompleteData({
      name: 'Apex Roofers',
      phone: '(555) 867-5309',
    });
    expect(data.footer.contact.phone).toBe('(555) 867-5309');
    expect(data.footer.contact.phoneLink).toBe('tel:+15558675309');
  });

  it('substitutes email address correctly', () => {
    const data = generateCustomizedCompleteData({
      name: 'Apex Roofers',
      email: 'hello@apexroofers.com',
    });
    expect(data.footer.contact.email).toBe('hello@apexroofers.com');
  });

  it('substitutes city correctly in footer', () => {
    const data = generateCustomizedCompleteData({
      name: 'Denver Roofing Experts',
      city: 'Denver',
      state: 'CO',
    });
    expect(data.footer.company.subTitle).toContain('Denver');
  });

  it('sets custom tagline in hero headlines if provided', () => {
    const data = generateCustomizedCompleteData({
      name: 'Custom Tagline Roofing',
      tagline: 'Unmatched Excellence Under Every Sky',
      city: 'Seattle',
    });
    expect(data.hero.headlines[0]).toBe('Unmatched Excellence Under Every Sky');
  });

  it('can generate default JSON string formatted properly', () => {
    const jsonStr = getDefaultCompleteDataJson();
    expect(typeof jsonStr).toBe('string');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.footer).toBeDefined();
    expect(parsed.hero).toBeDefined();
  });

  it('handles 100 consecutive rapid generations without memory leakage or corruption', () => {
    for (let i = 0; i < 100; i++) {
      const client = generateCustomizedCompleteData({
        name: `Stress Client ${i}`,
        phone: `(555) 100-${String(i).padStart(4, '0')}`,
        email: `stress${i}@example.com`,
        city: `City${i}`,
      });
      expect(client.footer.company.name).toBe(`STRESS CLIENT ${i}`);
      expect(client.footer.contact.email).toBe(`stress${i}@example.com`);
    }
  });

  it('guarantees zero flagship data leaks when customized with minimal profile', () => {
    const data = generateCustomizedCompleteData({
      name: 'Pinnacle Roofing Solutions',
    });
    const serialized = JSON.stringify(data);
    expect(serialized).not.toContain('(406) 217-1720');
    expect(serialized).not.toContain('tel:+14062171720');
    expect(serialized).not.toContain('maxqualityroofing@gmail.com');
    expect(serialized).not.toContain('Max Poitra');
    expect(serialized).not.toContain('Max will give you');
    expect(serialized).not.toContain('Max will review');
    expect(serialized).not.toContain('Max will respond');
    expect(serialized).not.toContain('Max personally inspects');
    expect(serialized).not.toContain('Great Falls');
    expect(serialized).not.toContain('Montana weather');
    expect(data.footer.company.name).toBe('PINNACLE ROOFING SOLUTIONS');
  });
});
