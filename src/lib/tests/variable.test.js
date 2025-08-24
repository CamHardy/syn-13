import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Variables', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('supports variable declarations', () => {
    System.run('var x = 2; var y = 3; print x + y;');
    expect(consoleMock).lastCalledWith('5');
    System.run('var msg = "hi"; print msg;');
    expect(consoleMock).lastCalledWith('hi');
  });
});