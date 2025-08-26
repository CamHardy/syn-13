import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Closures', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
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

  it('assign to closure', () => {
    System.run(`
      var f;
      var g;

      {
        var local = "local";
        fun f_() {
          print local;
          local = "after f";
          print local;
        }
        f = f_;

        fun g_() {
          print local;
          local = "after g";
          print local;
        }
        g = g_;
      }

      f();
      g();
    `);
    expect(consoleMock).nthCalledWith(1, 'local');
    expect(consoleMock).nthCalledWith(2, 'after f');
    expect(consoleMock).nthCalledWith(3, 'after f');
    expect(consoleMock).nthCalledWith(4, 'after g');
  });

  it('assign to shadowed later', () => {
    System.run(`
      var a = "global";

      {
        fun assign() {
          a = "assigned";
        }

        var a = "inner";
        assign();
        print a;
      }

      print a;
    `);
    expect(consoleMock).nthCalledWith(1, 'inner');
    expect(consoleMock).nthCalledWith(2, 'assigned');
  });

  it('close over function parameter', () => {
    System.run(`
      var f;

      fun foo(param) {
        fun f_() {
          print param;
        }
        f = f_;
      }
      foo("param");

      f();
    `);
  });

  it('close over later variable', () => {
    System.run(`
      fun f() {
        var a = "a";
        var b = "b";
        fun g() {
          print b;
          print a;
        }
        g();
      }
      f();
    `);
    expect(consoleMock).nthCalledWith(1, "b");
    expect(consoleMock).nthCalledWith(2, "a");
  });

  it('close over method parameter', () => {
    System.run(`
      var f;

      class Foo {
        method(param) {
          fun f_() {
            print param;
          }
          f = f_;
        }
      }

      Foo().method("param");
      f();
    `);
    expect(consoleMock).lastCalledWith('param');
  });
});