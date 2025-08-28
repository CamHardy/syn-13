import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Functions', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
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

  it('body must be block', () => {
    System.run('fun f() 123;');
    expect(consoleMock).nthCalledWith(1, expect.stringContaining("Error at '123': Expected '{' before function body."));
  });

  it('empty body', () => {
    System.run(`
      fun f() {}
      print f();
    `);
    expect(consoleMock).lastCalledWith('nil');
  });

  it('extra arguments', () => {
    expect(() => System.run(`
      fun f(a, b) {
        print a;
        print b;
      }

      f(1, 2, 3, 4);
    `)).toThrowError('Expected 2 arguments but got 4.');
  });

  it('local mutual recursion', () => {
    expect(() => System.run(`
      {
        fun isEven(n) {
          if (n == 0) return true;
          return isOdd(n - 1);
        }

        fun isOdd(n) {
          if (n == 0) return false;
          return isEven(n - 1);
        }

        isEven(4);
      }
    `)).toThrowError("Undefined variable 'isOdd'.");
  });

  it('local recursion', () => {
    System.run(`
      {
        fun fib(n) {
          if (n < 2) return n;
          return fib(n - 1) + fib(n - 2);
        }

        print fib(8);
      }
    `);
    expect(consoleMock).lastCalledWith('21');
  });

  it('missing arguments', () => {
    expect(() => System.run(`
      fun f(a, b) {}

      f(1);
    `)).toThrowError('Expected 2 arguments but got 1.');
  });

  it('missing comma in parameters', () => {
    System.run('fun foo(a, b c, d, e, f) {}');
    expect(consoleMock).nthCalledWith(1, expect.stringContaining("Error at 'c': Expected ')' after function parameters."));
  });
});