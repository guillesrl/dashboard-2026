import { describe, it, expect } from 'vitest';
import { parseNumber, cn } from '@/lib/utils';

describe('parseNumber', () => {
  it('returns 0 for null/undefined/empty', () => {
    expect(parseNumber(null)).toBe(0);
    expect(parseNumber(undefined)).toBe(0);
    expect(parseNumber('')).toBe(0);
  });

  it('returns the number as-is when already a number', () => {
    expect(parseNumber(42)).toBe(42);
    expect(parseNumber(3.14)).toBe(3.14);
  });

  it('parses strings with dot decimal separator', () => {
    expect(parseNumber('12.5')).toBe(12.5);
  });

  it('parses strings with comma decimal separator (European format)', () => {
    expect(parseNumber('12,5')).toBe(12.5);
  });

  it('returns 0 for non-numeric strings', () => {
    expect(parseNumber('abc')).toBe(0);
  });
});

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('resolves tailwind conflicts (last wins)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });
});
