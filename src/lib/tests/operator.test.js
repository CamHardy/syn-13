import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Operators', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
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
    expect(() => System.run('"1" / 1;')).toThrowError('Operands must be numbers.');
  });

  it('divide number by non-number', () => {
    expect(() => System.run('1 / "1";')).toThrowError('Operands must be numbers.');
  });
  
  it('equals', () => {
    System.run(`
      print nil == nil;
      print true == true;
      print true == false;
      print 1 == 1;
      print 1 == 2;
      print "str" == "str";
      print "str" == "ing";
      print nil == false;
      print false == 0;
      print 0 == "0";
    `);
    expect(consoleMock).nthCalledWith(1, 'true');
    expect(consoleMock).nthCalledWith(2, 'true');
    expect(consoleMock).nthCalledWith(3, 'false');
    expect(consoleMock).nthCalledWith(4, 'true');
    expect(consoleMock).nthCalledWith(5, 'false');
    expect(consoleMock).nthCalledWith(6, 'true');
    expect(consoleMock).nthCalledWith(7, 'false');
    expect(consoleMock).nthCalledWith(8, 'false');
    expect(consoleMock).nthCalledWith(9, 'false');
    expect(consoleMock).nthCalledWith(10, 'false');
  });

  it('equals class', () => {
    System.run(`
      class Foo {}
      class Bar {}

      print Foo == Foo;
      print Foo == Bar;
      print Bar == Foo;
      print Bar == Bar;

      print Foo == "Foo";
      print Foo == nil;
      print Foo == 123;
      print Foo == true;
    `);
    expect(consoleMock).nthCalledWith(1, 'true');
    expect(consoleMock).nthCalledWith(2, 'false');
    expect(consoleMock).nthCalledWith(3, 'false');
    expect(consoleMock).nthCalledWith(4, 'true');
    expect(consoleMock).nthCalledWith(5, 'false');
    expect(consoleMock).nthCalledWith(6, 'false');
    expect(consoleMock).nthCalledWith(7, 'false');
    expect(consoleMock).nthCalledWith(8, 'false');
  });

  it('equals method', () => {
    System.run(`
      class Foo {
        method() {}
      }

      var foo = Foo();
      var fooMethod = foo.method;

      print fooMethod == fooMethod;
      print foo.method == foo.method;
    `);
    expect(consoleMock).nthCalledWith(1, 'true');
    expect(consoleMock).nthCalledWith(2, 'false');
  });

  it('greater non-number than number', () => {
    expect(() => System.run('"1" > 1;')).toThrowError('Operands must be numbers.');
  });

  it('greater number than non-number', () => {
    expect(() => System.run('1 > "1";')).toThrowError('Operands must be numbers.');
  });

  it('greater or equal non-number than number', () => {
    expect(() => System.run('"1" >= 1;')).toThrowError('Operands must be numbers.');
  });

  it('greater or equal number than non-number', () => {
    expect(() => System.run('1 >= "1";')).toThrowError('Operands must be numbers.');
  });

  it('less non-number than number', () => {
    expect(() => System.run('"1" < 1;')).toThrowError('Operands must be numbers.');
  });

  it('less number than non-number', () => {
    expect(() => System.run('1 < "1";')).toThrowError('Operands must be numbers.');
  });

  it('less or equal non-number than number', () => {
    expect(() => System.run('"1" <= 1;')).toThrowError('Operands must be numbers.');
  });

  it('less or equal number than non-number', () => {
    expect(() => System.run('1 <= "1";')).toThrowError('Operands must be numbers.');
  });
  
  it('multiply', () => {
    System.run(`
      print 5 * 3;
      print 12.34 * 0.3;
    `);
    expect(consoleMock).nthCalledWith(1, '15');
    expect(consoleMock).nthCalledWith(2, '3.702');
  });

  it('multiply non-number by number', () => {
    expect(() => System.run('"1" * 1;')).toThrowError('Operands must be numbers.');
  });

  it('multiply number by non-number', () => {
    expect(() => System.run('1 * "1";')).toThrowError('Operands must be numbers.');
  });

  it('negate', () => {
    System.run(`
      print -(3);
      print --(3);
      print ---(3);
    `);
    expect(consoleMock).nthCalledWith(1, '-3');
    expect(consoleMock).nthCalledWith(2, '3');
    expect(consoleMock).nthCalledWith(3, '-3');
  });

  it('negate non-number', () => {
    expect(() => System.run('-"s";')).toThrowError('Operand must be a number.');
  });

  it('not', () => {
    System.run(`
      print !true;
      print !false;
      print !!true;
      print !123;
      print !0;
      print !nil;
      print !"";

      fun foo() {}
      print !foo;
    `);
    expect(consoleMock).nthCalledWith(1, 'false');
    expect(consoleMock).nthCalledWith(2, 'true');
    expect(consoleMock).nthCalledWith(3, 'true');
    expect(consoleMock).nthCalledWith(4, 'false');
    expect(consoleMock).nthCalledWith(5, 'false');
    expect(consoleMock).nthCalledWith(6, 'true');
    expect(consoleMock).nthCalledWith(7, 'false');
    expect(consoleMock).nthCalledWith(8, 'false');
  });

  it('not class', () => {
    System.run(`
      class Bar {}
      print !Bar;
      print !Bar();
    `);
    expect(consoleMock).nthCalledWith(1, 'false');
    expect(consoleMock).nthCalledWith(2, 'false');
  });

  it('not equals', () => {
    System.run(`
      print nil != nil;
      print true != true;
      print true != false;
      print 1 != 1;
      print 1 != 2;
      print "str" != "str";
      print "str" != "ing";
      print nil != false;
      print false != 0;
      print 0 != "0";
    `);
    expect(consoleMock).nthCalledWith(1, 'false');
    expect(consoleMock).nthCalledWith(2, 'false');
    expect(consoleMock).nthCalledWith(3, 'true');
    expect(consoleMock).nthCalledWith(4, 'false');
    expect(consoleMock).nthCalledWith(5, 'true');
    expect(consoleMock).nthCalledWith(6, 'false');
    expect(consoleMock).nthCalledWith(7, 'true');
    expect(consoleMock).nthCalledWith(8, 'true');
    expect(consoleMock).nthCalledWith(9, 'true');
    expect(consoleMock).nthCalledWith(10, 'true');
  });

  it('subtract', () => {
    System.run(`
      print 4 - 3;
      print 1.2 - 1.2;
    `);
    expect(consoleMock).nthCalledWith(1, '1');
    expect(consoleMock).nthCalledWith(2, '0');
  });

  it('subtract non-number from number', () => {
    expect(() => System.run('"1" - 1;')).toThrowError('Operands must be numbers.');
  });

  it('subtract number from non-number', () => {
    expect(() => System.run('1 - "1";')).toThrowError('Operands must be numbers.');
  });
});