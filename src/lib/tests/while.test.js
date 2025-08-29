import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('While Loops', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('runs while loops', () => {
    System.run('var i = 0; while (i < 5) { print i; i = i + 1; }');
    expect(consoleMock).nthCalledWith(1, '0');
    expect(consoleMock).nthCalledWith(2, '1');
    expect(consoleMock).nthCalledWith(3, '2');
    expect(consoleMock).nthCalledWith(4, '3');
    expect(consoleMock).nthCalledWith(5, '4');
  });

  it('class in body', () => {
    System.run('while (true) class Foo {}');
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'class': Expected expression."));
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
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'fun': Expected expression."));
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
  // commit
  it('return inside', () => {});
  it('syntax', () => {});
  it('var in body', () => {});
});