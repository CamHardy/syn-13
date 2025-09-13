import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Methods', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('arity', () => {
		System.run(`
			class Foo {
				method0() { return "no args"; }
				method1(a) { return a; }
				method2(a, b) { return a + b; }
				method3(a, b, c) { return a + b + c; }
				method4(a, b, c, d) { return a + b + c + d; }
				method5(a, b, c, d, e) { return a + b + c + d + e; }
				method6(a, b, c, d, e, f) { return a + b + c + d + e + f; }
				method7(a, b, c, d, e, f, g) { return a + b + c + d + e + f + g; }
				method8(a, b, c, d, e, f, g, h) { return a + b + c + d + e + f + g + h; }
			}

			var foo = Foo();
			print foo.method0();
			print foo.method1(1);
			print foo.method2(1, 2);
			print foo.method3(1, 2, 3);
			print foo.method4(1, 2, 3, 4);
			print foo.method5(1, 2, 3, 4, 5);
			print foo.method6(1, 2, 3, 4, 5, 6);
			print foo.method7(1, 2, 3, 4, 5, 6, 7);
			print foo.method8(1, 2, 3, 4, 5, 6, 7, 8);
		`);
		expect(consoleMock).nthCalledWith(1, 'no args');
		expect(consoleMock).nthCalledWith(2, '1');
		expect(consoleMock).nthCalledWith(3, '3');
		expect(consoleMock).nthCalledWith(4, '6');
		expect(consoleMock).nthCalledWith(5, '10');
		expect(consoleMock).nthCalledWith(6, '15');
		expect(consoleMock).nthCalledWith(7, '21');
		expect(consoleMock).nthCalledWith(8, '28');
		expect(consoleMock).nthCalledWith(9, '36');
	});

  it('empty block', () => {
		System.run(`
			class Foo {
				bar() {}
			}

			print Foo().bar();
		`);
		expect(consoleMock).lastCalledWith('nil');
	});

  it('extra arguments', () => {
		expect(() => System.run(`
			class Foo {
				method(a, b) {
					print a;
					print b;
				}
			}

			Foo().method(1, 2, 3, 4);
		`)).toThrowError('Expected 2 arguments but got 4.');
	});

  it('missing arguments', () => {
		expect(() => System.run(`
			class Foo {
				method(a, b) {}
			}

			Foo().method(1);
		`)).toThrowError('Expected 2 arguments but got 1.');
	});

  it('not found', () => {
		expect(() => System.run(`
			class Foo {}

			Foo().unknown();
		`)).toThrowError("Undefined property 'unknown'.");
	});
});