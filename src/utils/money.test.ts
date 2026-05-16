import { describe, expect, it } from 'vitest';

import { centsToEuros, eurosToCents, formatCents, parseEuroInputToCents } from './money';

describe('money helpers', () => {
  it('parses euro input at cent precision', () => {
    expect(parseEuroInputToCents('12')).toBe(1200);
    expect(parseEuroInputToCents('12.34')).toBe(1234);
    expect(parseEuroInputToCents('12,3')).toBe(1230);
    expect(parseEuroInputToCents('0.05')).toBe(5);
  });

  it('rejects invalid cent precision input', () => {
    expect(parseEuroInputToCents('')).toBeNull();
    expect(parseEuroInputToCents('10.999')).toBeNull();
    expect(parseEuroInputToCents('abc')).toBeNull();
  });

  it('converts cents and euros consistently', () => {
    expect(eurosToCents(19.99)).toBe(1999);
    expect(centsToEuros(1999)).toBe(19.99);
    expect(formatCents(1999)).toBe('19.99');
  });
});