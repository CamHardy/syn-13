import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../tree-walker/system.js';

describe('If Statements', () => {
  const consoleMock = vi.spyOn(console, 'log');
  const errorMock = vi.spyOn(console, 'error');

  afterEach(() => {
    consoleMock.mockClear();
		errorMock.mockClear();
  });

  it('class in else', () => {
    System.run('if (true) "ok"; else class Foo {}');
    expect(errorMock).lastCalledWith(expect.stringContaining("Error at 'class': Expected expression."));
  });

  it('class in then', () => {
    System.run('if (false) class Foo {}');
    expect(errorMock).lastCalledWith(expect.stringContaining("Error at 'class': Expected expression."));
  });

  it('dangling else', () => {
    System.run(`
      if (true) if (false) print "bad"; else print "good";
      if (false) if (true) print "bad"; else print "bad";
    `);
    expect(consoleMock).toHaveBeenCalledOnce();
    expect(consoleMock).lastCalledWith('good');
  });

  it('else', () => {
    System.run(`
      if (true) print "good"; else print "bad";
      if (false) print "bad"; else print "good";
      if (false) nil; else { print "block"; }
    `);
    expect(consoleMock).nthCalledWith(1, 'good');
    expect(consoleMock).nthCalledWith(2, 'good');
    expect(consoleMock).nthCalledWith(3, 'block');
  });

  it('function in else', () => {
    System.run('if (true) "ok"; else fun foo() {}');
    expect(errorMock).lastCalledWith(expect.stringContaining("Error at 'fun': Expected expression."));
  });

  it('function in then', () => {
    System.run('if (true) fun foo() {}');
    expect(errorMock).lastCalledWith(expect.stringContaining("Error at 'fun': Expected expression."));
  });

  it('if', () => {
    System.run(`
      if (true) print "good";
      if (false) print "bad";
      if (true) { print "block"; }
      var a = false;
      if (a = true) print a;
    `);
    expect(consoleMock).nthCalledWith(1, 'good');
    expect(consoleMock).nthCalledWith(2, 'block');
    expect(consoleMock).nthCalledWith(3, 'true');
  });

  it('truth', () => {
    System.run(`
      if (false) print "bad"; else print "false";
      if (nil) print "bad"; else print "nil";
      if (true) print true;
      if (0) print 0;
      if ("") print "empty";
    `);
    expect(consoleMock).nthCalledWith(1, 'false');
    expect(consoleMock).nthCalledWith(2, 'nil');
    expect(consoleMock).nthCalledWith(3, 'true');
    expect(consoleMock).nthCalledWith(4, '0');
    expect(consoleMock).nthCalledWith(5, 'empty');
  });

  it('var in else', () => {
    System.run('if (true) "ok"; else var foo;');
    expect(errorMock).lastCalledWith(expect.stringContaining("Error at 'var': Expected expression."));
  });

  it('var in then', () => {
    System.run('if (true) var foo;');
    expect(errorMock).lastCalledWith(expect.stringContaining("Error at 'var': Expected expression."));
  });
});