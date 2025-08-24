import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Closures', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('supports closures', () => {
    System.run(`
      fun makeCounter() {
        var i = 0;
        fun count() {
          i = i + 1;
          print i;
        }
        return count;
      }
      var counter = makeCounter();
      counter();
      counter();
      counter();
    `);
    expect(consoleMock).lastCalledWith('3');
  });
});