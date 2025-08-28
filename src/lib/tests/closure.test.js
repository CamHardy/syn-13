import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Closures', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
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

  it('closed closure in function', () => {
    System.run(`
      var f;

      {
        var local = "local";
        fun f_() {
          print local;
        }
        f = f_;
      }

      f();
    `);
    expect(consoleMock).lastCalledWith('local');
  });

  it('nested closure', () => {
    System.run(`
      var f;

      fun f1() {
        var a = "a";
        fun f2() {
          var b = "b";
          fun f3() {
            var c = "c";
            fun f4() {
              print a;
              print b;
              print c;
            }
            f = f4;
          }
          f3();
        }
        f2();
      }
      f1();

      f();
    `);
    expect(consoleMock).nthCalledWith(1, 'a');
    expect(consoleMock).nthCalledWith(2, 'b');
    expect(consoleMock).nthCalledWith(3, 'c');
  });

  it('open closure in function', () => {
    System.run(`
      {
        var local = "local";
        fun f() {
          print local;
        }
        f();
      }
    `);
    expect(consoleMock).lastCalledWith('local');
  });

  it('reference closure multiple times', () => {
    System.run(`
      var f;

      {
        var a = "a";
        fun f_() {
          print a;
          print a;
        }
        f = f_;
      }

      f();
    `);
    expect(consoleMock).nthCalledWith(1, 'a');
    expect(consoleMock).nthCalledWith(2, 'a');
  });

  it('reuse closure slot', () => {
    System.run(`
      {
        var f;

        {
          var a = "a";
          fun f_() { print a; }
          f = f_;
        }

        {
          var b = "b";
          f();
        }
      }
    `);
    expect(consoleMock).lastCalledWith('a');
  });

  it('shadow closure with local', () => {
    System.run(`
      {
        var foo = "closure";
        fun f() {
          {
            print foo;
            var foo = "shadow";
            print foo;
          }
          print foo;
        }
        f();
      }
    `);
    expect(consoleMock).nthCalledWith(1, 'closure');
    expect(consoleMock).nthCalledWith(2, 'shadow');
    expect(consoleMock).nthCalledWith(3, 'closure');
  });

  it('unused closure', () => {
    System.run(`
      {
        var a = "a";
        if (false) {
          fun foo() { a; }
        }
      }

      print "ok";
    `);
    expect(consoleMock).lastCalledWith('ok');
  });

  it('unused later closure', () => {
    System.run(`
      var closure;

      {
        var a = "a";

        {
          var b = "b";
          fun returnA() {
            return a;
          }

          closure = returnA;

          if (false) {
            fun returnB() {
              return b;
            }
          }
        }

        print closure();
      }
    `);
    expect(consoleMock).lastCalledWith('a');
  });
});