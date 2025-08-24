import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Variables', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('supports variable declarations', () => {
    System.run('var x = 2; var y = 3; print x + y;');
    expect(consoleMock).lastCalledWith('5');
    System.run('var msg = "hi"; print msg;');
    expect(consoleMock).lastCalledWith('hi');
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
});