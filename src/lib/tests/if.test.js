import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('If Statements', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('runs if statements', () => {
    System.run('if (true) print 123;');
    expect(consoleMock).lastCalledWith('123');
    System.run('if (false) print 1; else print 2;');
    expect(consoleMock).lastCalledWith('2');
  });
});