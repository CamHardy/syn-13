import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Syn-13 Interpreter', () => {
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

  it('supports variable declarations', () => {
    System.run(`
      var a = "before"; print a;
      a = "after"; print a;
      print a = "arg";
      print a;
    `);
    expect(consoleMock).nthCalledWith(1, 'before');
    expect(consoleMock).nthCalledWith(2, 'after');
    expect(consoleMock).nthCalledWith(3, 'arg');
    expect(consoleMock).nthCalledWith(4, 'arg');
    System.run('var x = 2; var y = 3; print x + y;');
    expect(consoleMock).lastCalledWith('5');
    System.run('var msg = "hi"; print msg;');
    expect(consoleMock).lastCalledWith('hi');
    System.run(`
      var a = "a";
      (a) = "value";
    `);
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at '=': Invalid assignment target."));
    System.run(`
      var a = "a";
      var b = "b";
      a + b = "value";
    `);
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at '=': Invalid assignment target."));
    System.run(`
      {
        var a = "before";
        print a;
        a = "after";
        print a;
        print a = "arg";
        print a;
      }
    `);
    expect
  });

  it('supports variable re-assignment', () => {
    System.run('var a = 1; print a; a = 42; print a;');
    expect(consoleMock).nthCalledWith(1, '1');
    expect(consoleMock).nthCalledWith(2, '42');
  });

  it('supports right-associative assignment', () => {
    System.run(`
      var a = "a";
      var b = "b";
      var c = "c";
      a = b = c;
      print a;
      print b;
      print c;
    `);
    expect(consoleMock).nthCalledWith(1, 'c');
    expect(consoleMock).nthCalledWith(2, 'c');
    expect(consoleMock).nthCalledWith(3, 'c');
  });

  it('runs if statements', () => {
    System.run('if (true) print 123;');
    expect(consoleMock).lastCalledWith('123');
    System.run('if (false) print 1; else print 2;');
    expect(consoleMock).lastCalledWith('2');
  });

  it('runs while loops', () => {
    System.run('var i = 0; while (i < 5) { print i; i = i + 1; }');
    expect(consoleMock).nthCalledWith(1, '0');
    expect(consoleMock).nthCalledWith(2, '1');
    expect(consoleMock).nthCalledWith(3, '2');
    expect(consoleMock).nthCalledWith(4, '3');
    expect(consoleMock).nthCalledWith(5, '4');
  });

  it('runs for loops', () => {
    System.run('for (var i = 9; i >= 5; i = i - 1) print i;');
    expect(consoleMock).nthCalledWith(1, '9');
    expect(consoleMock).nthCalledWith(2, '8');
    expect(consoleMock).nthCalledWith(3, '7');
    expect(consoleMock).nthCalledWith(4, '6');
    expect(consoleMock).nthCalledWith(5, '5');
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