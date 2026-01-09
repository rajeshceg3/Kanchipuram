import { sanitizeHTML } from '../../src/scripts/utils.js';
import { describe, test, expect } from 'vitest';

describe('sanitizeHTML', () => {
  test('should return same string if no html tags', () => {
    const input = 'Hello World';
    expect(sanitizeHTML(input)).toBe(input);
  });

  test('should strip script tags', () => {
    const input = 'Hello <script>alert("xss")</script>World';
    expect(sanitizeHTML(input)).toBe('Hello World');
  });

  test('should keep safe tags', () => {
    const input = '<b>Bold</b>';
    expect(sanitizeHTML(input)).toBe('<b>Bold</b>');
  });
});
