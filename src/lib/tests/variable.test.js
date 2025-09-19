import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../tree-walker/system.js';

describe('Variables', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('collide with parameter', () => {
    System.run(`
      fun foo(a) {
        var a;
      }
    `);
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'a': Already a variable with this name in this scope."));
  });

  it('duplicate local', () => {
    System.run(`
      {
        var a = "value";
        var a = "other";
      }
    `);
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'a': Already a variable with this name in this scope."));
  });

  it('duplicate parameter', () => {
    System.run(`
      fun foo(arg, arg) {
        "body";
      }
    `);
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'arg': Already a variable with this name in this scope."));
  });

  it('early bound', () => {
    System.run(`
      var a = "outer";
      {
        fun foo() {
          print a;
        }

        foo();
        var a = "inner";
        foo();
      }
    `);
    expect(consoleMock).nthCalledWith(1, 'outer');
    expect(consoleMock).nthCalledWith(2, 'outer');
  });

  it('in middle of block', () => {
    System.run(`
      {
        var a = "a";
        print a;
        var b = a + " b";
        print b;
        var c = a + " c";
        print c;
        var d = b + " d";
        print d;
      }
    `);
    expect(consoleMock).nthCalledWith(1, 'a');
    expect(consoleMock).nthCalledWith(2, 'a b');
    expect(consoleMock).nthCalledWith(3, 'a c');
    expect(consoleMock).nthCalledWith(4, 'a b d');
  });

  it('in nested block', () => {
    System.run(`
      {
        var a = "outer";
        {
          print a;
        }
      }
    `);
    expect(consoleMock).lastCalledWith('outer');
  });

  it('local from method', () => {
    System.run(`
      var foo = "variable";

      class Foo {
        method() {
          print foo;
        }
      }

      Foo().method();
    `);
    expect(consoleMock).lastCalledWith('variable');
  });

  it('redeclare global', () => {
    System.run(`
      var a = "1";
      var a;
      print a;
    `);
    expect(consoleMock).lastCalledWith('nil');
  });

  it('redefine global', () => {
    System.run(`
      var a = "1";
      var a = "2";
      print a;
    `);
    expect(consoleMock).lastCalledWith('2');
  });

  it('scope reuse in different blocks', () => {
    System.run(`
      {
        var a = "first";
        print a;
      }
      {
        var a = "second";
        print a;
      }
    `);
    expect(consoleMock).nthCalledWith(1, 'first');
    expect(consoleMock).nthCalledWith(2, 'second');
  });

  it('shadow and local', () => {
    System.run(`
      {
        var a = "outer";
        {
          print a;
          var a = "inner";
          print a;
        }
      }
    `);
    expect(consoleMock).nthCalledWith(1, 'outer');
    expect(consoleMock).nthCalledWith(2, 'inner');
  });

  it('shadow global', () => {
    System.run(`
      var a = "global";
      {
        var a = "shadow";
        print a;
      }
      print a;
    `);
    expect(consoleMock).nthCalledWith(1, 'shadow');
    expect(consoleMock).nthCalledWith(2, 'global');
  });

  it('shadow local', () => {
    System.run(`
      {
        var a = "local";
        {
          var a = "shadow";
          print a;
        }
        print a;
      }
    `);
    expect(consoleMock).nthCalledWith(1, 'shadow');
    expect(consoleMock).nthCalledWith(2, 'local');
  });

  it('undefined global', () => {
    expect(() => System.run('print notDefined;')).toThrowError("Undefined variable 'notDefined'.");
  });

  it('undefined local', () => {
    expect(() => System.run('{ print notDefined; }')).toThrowError("Undefined variable 'notDefined'.");
  });

  it('uninitialized', () => {
    System.run(`
      var a;
      print a;
    `);
    expect(consoleMock).lastCalledWith('nil');
  });

  it('unreached undefined', () => {
    System.run(`
      if (false) {
        print notDefined;
      }

      print "ok";
    `);
    expect(consoleMock).lastCalledWith('ok');
  });

  it('use false as var', () => {
    System.run('var false = "value";');
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'false': Expected variable name."));
  });

  it('use global in initializer', () => {
    System.run(`
      var a = "value";
      var a = a;
      print a;
    `);
    expect(consoleMock).lastCalledWith('value');
  });

  it('use local in initializer', () => {
    expect(() => {
      System.run(`
        {
          var a = "outer";
          {
            var a = a;
          }
        }
      `);
    }).toThrowError("Error at 'a': Can't read local variable in its own initializer.");
  });

  it('use nil as var', () => {
    System.run('var nil = "value";');
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'nil': Expected variable name."));
  });

  it('use this as var', () => {
    System.run('var this = "value";');
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'this': Expected variable name."));
  });
});