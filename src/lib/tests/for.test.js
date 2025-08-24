import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('For Loops', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('runs for loops', () => {
    System.run('for (var i = 9; i >= 5; i = i - 1) print i;');
    expect(consoleMock).nthCalledWith(1, '9');
    expect(consoleMock).nthCalledWith(2, '8');
    expect(consoleMock).nthCalledWith(3, '7');
    expect(consoleMock).nthCalledWith(4, '6');
    expect(consoleMock).nthCalledWith(5, '5');
  });
});