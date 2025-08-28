import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('For Loops', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('runs for loops', () => {
    System.run('for (var i = 9; i >= 5; i = i - 1) print i;');
    expect(consoleMock).nthCalledWith(1, '9');
    expect(consoleMock).nthCalledWith(2, '8');
    expect(consoleMock).nthCalledWith(3, '7');
    expect(consoleMock).nthCalledWith(4, '6');
    expect(consoleMock).nthCalledWith(5, '5');
  });

  it('class in body', () => {
    System.run('for (;;) class Foo {}');
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'class': Expected expression."));
  });

  it('closure in body', () => {
    System.run(`
      var f1;
      var f2;
      var f3;

      for (var i = 1; i < 4; i = i + 1) {
        var j = i;
        fun f() {
          print i;
          print j;
        }

        if (j == 1) f1 = f;
        else if (j == 2) f2 = f;
        else f3 = f;
      }

      f1();
      f2();
      f3();
    `);
    expect(consoleMock).nthCalledWith(1, '4');
    expect(consoleMock).nthCalledWith(2, '1');
    expect(consoleMock).nthCalledWith(3, '4');
    expect(consoleMock).nthCalledWith(4, '2');
    expect(consoleMock).nthCalledWith(5, '4');
    expect(consoleMock).nthCalledWith(6, '3');
  });

  it('function in body', () => {
    System.run(`
      for (;;) fun foo() {}
    `);
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'fun': Expected expression."));
  });

  it('return closure', () => {
    System.run(`
      fun f() {
        for (;;) {
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
        for (;;) {
          var i = "i";
          return i;
        }
      }

      print f();
    `);
    expect(consoleMock).lastCalledWith('i');
  });

  it('scope', () => {
    System.run(`
      {
        var i = "before";

        for (var i = 0; i < 1; i = i + 1) {
          print i;

          var i = -1;
          print i;
        }
      }

      {
        for (var i = 0; i > 0; i = i + 1) {}

        var i = "after";
        print i;

        for (i = 0; i < 1; i = i + 1) {
          print i;
        }
      }
    `);
    expect(consoleMock).nthCalledWith(1, '0');
    expect(consoleMock).nthCalledWith(2, '-1');
    expect(consoleMock).nthCalledWith(3, 'after');
    expect(consoleMock).nthCalledWith(4, '0');
  });
});