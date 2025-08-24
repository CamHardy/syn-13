import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Booleans', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('handles boolean expressions', () => {
    System.run('print true;');
    expect(consoleMock).lastCalledWith('true');
    System.run('print false;');
    expect(consoleMock).lastCalledWith('false');
    System.run('print !true;');
    expect(consoleMock).lastCalledWith('false');
    System.run('print 3 < 5;');
    expect(consoleMock).lastCalledWith('true');
    System.run('print 3 == 3;');
    expect(consoleMock).lastCalledWith('true');
  });
});