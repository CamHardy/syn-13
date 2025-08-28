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

  it('statement condition', () => {
    System.run(`
      for (var a = 1; {}; a = a + 1) {}
    `);
    expect(consoleMock).nthCalledWith(1, expect.stringContaining("Error at '{': Expected expression."));
    expect(consoleMock).nthCalledWith(2, expect.stringContaining("Error at ')': Expected ; after expression."));
  });

  it('statement increment', () => {
    System.run(`
      for (var a = 1; a < 2; {}) {}
    `);
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at '{': Expected expression."));
  });

  it('statement initializer', () => {
    System.run('for ({}; a < 2; a = a + 1) {}');
    expect(consoleMock).nthCalledWith(1, expect.stringContaining("Error at '{': Expected expression."));
    expect(consoleMock).nthCalledWith(2, expect.stringContaining("Error at ')': Expected ; after expression."));
  });

  it('syntax', () => {
    System.run(`
      for (var c = 0; c < 3;) print c = c + 1;

      for (var a = 0; a < 3; a = a + 1) {
        print a;
      }

      fun foo() {
        for (;;) return "done";
      }
      print foo();

      var i = 0;
      for (; i < 2; i = i + 1) print i;

      fun bar() {
        for (var i = 0;; i = i + 1) {
          print i;
          if (i >= 2) return;
        }
      }
      bar();

      for (var i = 0; i < 2;) {
        print i;
        i = i + 1;
      }

      for (; false;) if (true) 1; else 2;
      for (; false;) while (true) 1;
      for (; false;) for (;;) 1;
    `);
    expect(consoleMock).nthCalledWith(1, '1');
    expect(consoleMock).nthCalledWith(2, '2');
    expect(consoleMock).nthCalledWith(3, '3');
    expect(consoleMock).nthCalledWith(4, '0');
    expect(consoleMock).nthCalledWith(5, '1');
    expect(consoleMock).nthCalledWith(6, '2');
    expect(consoleMock).nthCalledWith(7, 'done');
    expect(consoleMock).nthCalledWith(8, '0');
    expect(consoleMock).nthCalledWith(9, '1');
    expect(consoleMock).nthCalledWith(10, '0');
    expect(consoleMock).nthCalledWith(11, '1');
    expect(consoleMock).nthCalledWith(12, '2');
    expect(consoleMock).nthCalledWith(13, '0');
    expect(consoleMock).nthCalledWith(14, '1');
  });

  it('var in body', () => {
    System.run('for (;;) var foo;');
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'var': Expected expression."));
  });
});