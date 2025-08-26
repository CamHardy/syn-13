import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Assignment', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('associativity', () => {
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

  it('global', () => {
    System.run(`
      var a = "before";
      print a;

      a = "after";
      print a;

      print a = "arg";
      print a;
    `);
    expect(consoleMock).nthCalledWith(1, 'before');
    expect(consoleMock).nthCalledWith(2, 'after');
    expect(consoleMock).nthCalledWith(3, 'arg');
    expect(consoleMock).nthCalledWith(4, 'arg');
  });

  it('grouping', () => {
    System.run(`
      var a = "a";
      (a) = "value";
    `);
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at '=': Invalid assignment target."));
  });

  it('infix operator', () => {
    System.run(`
      var a = "a";
      var b = "b";
      a + b = "value";
    `);
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at '=': Invalid assignment target."));
  });

  it('local', () => {
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
    expect(consoleMock).nthCalledWith(1, 'before');
    expect(consoleMock).nthCalledWith(2, 'after');
    expect(consoleMock).nthCalledWith(3, 'arg');
    expect(consoleMock).nthCalledWith(4, 'arg');
  });

  it('prefix operator', () => {
    System.run(`
      var a = "a";
      !a = "value";
    `);
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at '=': Invalid assignment target."));
  });

  it('syntax', () => {
    System.run(`
      var a = "before";
      var c = a = "var";
      print a;
      print c;
    `);
    expect(consoleMock).nthCalledWith(1, 'var');
    expect(consoleMock).nthCalledWith(2, 'var');
  });

  it('to this', () => {
    System.run(`
      class Foo {
        Foo() {
          this = "value";
        }
      }

      Foo();
    `);
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at '=': Invalid assignment target."));
  });

  it('undefined', () => {
    
    expect(() => System.run('unknown = "what";')).toThrowError("Undefined variable 'unknown'");
  });
});