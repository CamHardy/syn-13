import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Functions', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('supports functions', () => {
    System.run(`
      fun add(a, b) {
        return a + b;
      }
      print add(2, 5);
    `);
    expect(consoleMock).lastCalledWith('7');
  });
});