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

  it('add', () => {
    System.run('print 123 + 456;');
    System.run('print "str" + "ing";');
    expect(consoleMock).nthCalledWith(1, '579');
    expect(consoleMock).nthCalledWith(2, 'string');
  });

  it('add bool and nil', () => {
    expect(() => System.run('true + nil;')).toThrowError('Operands must be two numbers or two strings.');
  });

  it('add bool and num', () => {
    expect(() => System.run('true + 123;')).toThrowError('Operands must be two numbers or two strings.');
  });

  it('add bool and string', () => {
    expect(() => System.run('true + "s";')).toThrowError('Operands must be two numbers or two strings.');
  });

  it('add nil and nil', () => {
    expect(() => System.run('nil + nil;')).toThrowError('Operands must be two numbers or two strings.');
  });

  it('add num and nil', () => {
    expect(() => System.run('1 + nil;')).toThrowError('Operands must be two numbers or two strings.');
  });

  it('add string and nil', () => {
    expect(() => System.run('"s" + nil;')).toThrowError('Operands must be two numbers or two strings.');
  });

  it('comparison', () => {
    System.run(`
      print 1 < 2;
      print 2 < 2;
      print 2 < 1;
      print 1 <= 2;
      print 2 <= 2;
      print 2 <= 1;
      print 1 > 2;
      print 2 > 2;
      print 2 > 1;
      print 1 >= 2;
      print 2 >= 2;
      print 2 >= 1;
      print 0 < -0;
      print -0 < 0;
      print 0 > -0;
      print -0 > 0;
      print 0 <= -0;
      print -0 <= 0;
      print 0 >= -0;
      print -0 >= 0;
    `);
    expect(consoleMock).nthCalledWith(1, 'true');
    expect(consoleMock).nthCalledWith(2, 'false');
    expect(consoleMock).nthCalledWith(3, 'false');
    expect(consoleMock).nthCalledWith(4, 'true');
    expect(consoleMock).nthCalledWith(5, 'true');
    expect(consoleMock).nthCalledWith(6, 'false');
    expect(consoleMock).nthCalledWith(7, 'false');
    expect(consoleMock).nthCalledWith(8, 'false');
    expect(consoleMock).nthCalledWith(9, 'true');
    expect(consoleMock).nthCalledWith(10, 'false');
    expect(consoleMock).nthCalledWith(11, 'true');
    expect(consoleMock).nthCalledWith(12, 'true');
    expect(consoleMock).nthCalledWith(13, 'false');
    expect(consoleMock).nthCalledWith(14, 'false');
    expect(consoleMock).nthCalledWith(15, 'false');
    expect(consoleMock).nthCalledWith(16, 'false');
    expect(consoleMock).nthCalledWith(17, 'true');
    expect(consoleMock).nthCalledWith(18, 'true');
    expect(consoleMock).nthCalledWith(19, 'true');
    expect(consoleMock).nthCalledWith(20, 'true');
  });

  it('divide', () => {
    System.run('print 8 / 2;');
    System.run('print 12.34 / 12.34;');
    expect(consoleMock).nthCalledWith(1, '4');
    expect(consoleMock).nthCalledWith(2, '1');
  });

  it('divide non-number by number', () => {
    expect(() => System.run('print "1" / 1;')).toThrowError('Operands must be numbers.');
  });

  it('divide number by non-number', () => {
    expect(() => System.run('print 1 / "1";')).toThrowError('Operands must be numbers.');
  });
});