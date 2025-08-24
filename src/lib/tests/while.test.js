import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('While Loops', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('runs while loops', () => {
    System.run('var i = 0; while (i < 5) { print i; i = i + 1; }');
    expect(consoleMock).nthCalledWith(1, '0');
    expect(consoleMock).nthCalledWith(2, '1');
    expect(consoleMock).nthCalledWith(3, '2');
    expect(consoleMock).nthCalledWith(4, '3');
    expect(consoleMock).nthCalledWith(5, '4');
  });
});