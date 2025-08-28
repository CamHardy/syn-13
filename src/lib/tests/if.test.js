import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('If Statements', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('runs if statements', () => {
    System.run('if (true) print 123;');
    expect(consoleMock).lastCalledWith('123');
    System.run('if (false) print 1; else print 2;');
    expect(consoleMock).lastCalledWith('2');
  });

  it('class in else', () => {
    System.run('if (true) "ok"; else class Foo {}');
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'class': Expected expression."));
  });

  it('class in then', () => {
    System.run('if (false) class Foo {}');
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'class': Expected expression."));
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
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'fun': Expected expression."));
  });

  it('function in then', () => {
    System.run('if (true) fun foo() {}');
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'fun': Expected expression."));
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
});