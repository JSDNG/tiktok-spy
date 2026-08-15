import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { sanitizeRedirect } from '@/lib/safeRedirect';

describe('sanitizeRedirect', () => {
  const originalAuthUrl = process.env.AUTH_URL;

  beforeEach(() => {
    process.env.AUTH_URL = 'https://tiktokspy.supover.com';
  });

  afterEach(() => {
    process.env.AUTH_URL = originalAuthUrl;
  });

  it('passes through an internal relative path unchanged', () => {
    expect(sanitizeRedirect('/admin')).toBe('/admin');
  });

  it('rejects protocol-relative paths ("//evil.com") to prevent open redirect', () => {
    expect(sanitizeRedirect('//evil.com')).toBe('/');
  });

  it('converts an absolute URL on the trusted origin to a relative path', () => {
    expect(sanitizeRedirect('https://tiktokspy.supover.com/admin')).toBe('/admin');
  });

  it('preserves query string and hash when converting an absolute trusted URL', () => {
    expect(sanitizeRedirect('https://tiktokspy.supover.com/tasks/abc?x=1#y')).toBe('/tasks/abc?x=1#y');
  });

  it('rejects an absolute URL on a different origin (open redirect attempt)', () => {
    expect(sanitizeRedirect('https://evil.com/admin')).toBe('/');
  });

  it('falls back to "/" when AUTH_URL is not configured, even for a same-looking host', () => {
    delete process.env.AUTH_URL;
    expect(sanitizeRedirect('https://tiktokspy.supover.com/admin')).toBe('/');
  });

  it('falls back to "/" for non-string, empty, or garbage input', () => {
    expect(sanitizeRedirect(null)).toBe('/');
    expect(sanitizeRedirect('')).toBe('/');
    expect(sanitizeRedirect('not a url')).toBe('/');
  });
});
