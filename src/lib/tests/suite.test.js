import { afterAll, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Syn-13 Interpreter', () => {
  const consoleMock = vi.spyOn(console, 'log').mockImplementation(() => undefined);

  afterAll(() => {
    consoleMock.mockReset();
  });

  it('evaluates arithmetic expressions', () => {
    System.run('print 1 + 2;');
    expect(consoleMock).toHaveBeenLastCalledWith('3');
    System.run('print (2 * 3) + 4;');
    expect(consoleMock).toHaveBeenLastCalledWith('10');
    System.run('print 5 - 3 * 2;');
    expect(consoleMock).toHaveBeenLastCalledWith('-1');
  });

  it('handles boolean expressions', () => {
    System.run('print true;');
    expect(consoleMock).toHaveBeenLastCalledWith('true');
    System.run('print false;');
    expect(consoleMock).toHaveBeenLastCalledWith('false');
    System.run('print !true;');
    expect(consoleMock).toHaveBeenLastCalledWith('false');
    System.run('print 3 < 5;');
    expect(consoleMock).toHaveBeenLastCalledWith('true');
    System.run('print 3 == 3;');
    expect(consoleMock).toHaveBeenLastCalledWith('true');
  });
});