import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../tree-walker/system.js';

describe('Return', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('after else', () => {
		System.run(`
			fun f() {
				if (false) "no"; else return "ok";
			}
			
			print f();
		`);
		expect(consoleMock).lastCalledWith('ok');
	});

  it('after if', () => {
		System.run(`
			fun f() {
				if (true) return "ok";
			}
				
			print f();
		`);
		expect(consoleMock).lastCalledWith('ok');
	});

  it('after while', () => {
		System.run(`
			fun f() {
				while (true) return "ok";
			}
				
			print f();
		`);
		expect(consoleMock).lastCalledWith('ok');
	});
	
  it('at top level', () => {
		System.run('return "wat";');
		expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'return': Can't return from top-level code."));
	});

  it('in function', () => {
		System.run(`
			fun f() {
				return "ok";
				print "bad";
			}
			
			print f();
		`);
		expect(consoleMock).lastCalledWith('ok');
	});

  it('in method', () => {
		System.run(`
			class Foo {
				method() {
					return "ok";
					print "bad";
				}
			}
			
			print Foo().method();
		`);
		expect(consoleMock).lastCalledWith('ok');
	});

  it('return nil if no value', () => {
		System.run(`
			fun f() {
				return;
				print "bad";
			}

			print f();
		`);
		expect(consoleMock).lastCalledWith('nil');
	});
});