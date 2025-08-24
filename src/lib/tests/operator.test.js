import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Operators', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('evaluates arithmetic expressions', () => {
    System.run('print 1 + 2;');
    expect(consoleMock).lastCalledWith('3');
    System.run('print (2 * 3) + 4;');
    expect(consoleMock).lastCalledWith('10');
    System.run('print 5 - 3 * 2;');
    expect(consoleMock).lastCalledWith('-1');
  });
});