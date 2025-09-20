import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../tree-walker/system.js';

describe('While Loops', () => {
  const consoleMock = vi.spyOn(console, 'log');
  const errorMock = vi.spyOn(console, 'error');

  afterEach(() => {
    consoleMock.mockClear();
		errorMock.mockClear();
  });

  it('class in body', () => {
    System.run('while (true) class Foo {}');
    expect(errorMock).lastCalledWith(expect.stringContaining("Error at 'class': Expected expression."));
  });

  it('closure in body', () => {
    System.run(`
      var f1;
      var f2;
      var f3;

      var i = 1;
      while (i < 4) {
        var j = i;
        fun f() { print j; }

        if (j == 1) f1 = f;
        else if (j == 2) f2 = f;
        else f3 = f;

        i = i + 1;
      }

      f1();
      f2();
      f3();
    `);
    expect(consoleMock).nthCalledWith(1, '1');
    expect(consoleMock).nthCalledWith(2, '2');
    expect(consoleMock).nthCalledWith(3, '3');
  });

  it('function in body', () => {
    System.run('while (true) fun foo() {}');
    expect(errorMock).lastCalledWith(expect.stringContaining("Error at 'fun': Expected expression."));
  });

  it('return closure', () => {
    System.run(`
      fun f() {
        while (true) {
          var i = "i";
          fun g() { print i; }
          return g;
        }
      }

      var h = f();
      h();
    `);
    expect(consoleMock).lastCalledWith('i');
  });
  
  it('return inside', () => {
    System.run(`
      fun f() {
        while (true) {
          var i = "i";
          return i;
        }
      }

      print f();
    `);
    expect(consoleMock).lastCalledWith('i');
  });

  it('syntax', () => {
    System.run(`
      var c = 0;
      while (c < 3) print c = c + 1;

      var a = 0;
      while (a < 3) {
        print a;
        a = a + 1;
      }

      while (false) if (true) 1; else 2;
      while (false) while (true) 1;
      while (false) for (;;) 1;
    `);
    expect(consoleMock).nthCalledWith(1, '1');
    expect(consoleMock).nthCalledWith(2, '2');
    expect(consoleMock).nthCalledWith(3, '3');
    expect(consoleMock).nthCalledWith(4, '0');
    expect(consoleMock).nthCalledWith(5, '1');
    expect(consoleMock).nthCalledWith(6, '2');
  });

  it('var in body', () => {
    System.run('while (true) var foo;');
    expect(errorMock).lastCalledWith(expect.stringContaining("Error at 'var': Expected expression."));
  });
});