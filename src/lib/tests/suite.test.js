import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Syn-13 Interpreter', () => {
  const consoleMock = vi.spyOn(console, 'log').mockImplementation(() => undefined);

  afterEach(() => {
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

  it('supports variable declarations', () => {
    System.run('var a = 10; print a;');
    expect(consoleMock).toHaveBeenLastCalledWith('10');
    System.run('var x = 2; var y = 3; print x + y;');
    expect(consoleMock).toHaveBeenLastCalledWith('5');
    System.run('var msg = "hi"; print msg;');
    expect(consoleMock).toHaveBeenLastCalledWith('hi');
  });

  it('supports variable re-assignment', () => {
    System.run('var a = 1; print a; a = 42; print a;');
    expect(consoleMock).toHaveBeenNthCalledWith(1, '1');
    expect(consoleMock).toHaveBeenNthCalledWith(2, '42');
  });

  it('runs if statements', () => {
    System.run('if (true) print 123;');
    expect(consoleMock).toHaveBeenLastCalledWith('123');
    System.run('if (false) print 1; else print 2;');
    expect(consoleMock).toHaveBeenLastCalledWith('2');
  });

  it('runs while loops', () => {
    System.run('var i = 0; while (i < 5) { print i; i = i + 1; }');
    expect(consoleMock).toHaveBeenNthCalledWith(1, '0');
    expect(consoleMock).toHaveBeenNthCalledWith(2, '1');
    expect(consoleMock).toHaveBeenNthCalledWith(3, '2');
    expect(consoleMock).toHaveBeenNthCalledWith(4, '3');
    expect(consoleMock).toHaveBeenNthCalledWith(5, '4');
  });

  it('runs for loops', () => {
    System.run('for (var i = 9; i >= 5; i = i - 1) print i;');
    expect(consoleMock).toHaveBeenNthCalledWith(1, '9');
    expect(consoleMock).toHaveBeenNthCalledWith(2, '8');
    expect(consoleMock).toHaveBeenNthCalledWith(3, '7');
    expect(consoleMock).toHaveBeenNthCalledWith(4, '6');
    expect(consoleMock).toHaveBeenNthCalledWith(5, '5');
  });
});