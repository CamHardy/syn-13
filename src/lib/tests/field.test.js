import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Fields', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('call function field', () => {
		System.run(`
			class Foo {}

			fun bar(a, b) {
				print "bar";
				print a;
				print b;
			}

			var foo = Foo();
			foo.bar = bar;

			foo.bar(1, 2);
		`);
		expect(consoleMock).nthCalledWith(1, 'bar');
		expect(consoleMock).nthCalledWith(2, '1');
		expect(consoleMock).nthCalledWith(3, '2');
	});

  it('call non-function field', () => {
		expect(() => System.run(`
			class Foo {}

			var foo = Foo();
			foo.bar = "not fn";

			foo.bar();
		`)).toThrowError('Can only call functions and classes.');
	});

  it('get and set method', () => {
		System.run(`
			class Foo {
				method(a) {
					print "method";
					print a;
				}

				other(a) {
					print "other";
					print a;
				}
			}
				
			var foo = Foo();
			var method = foo.method;

			foo.method = foo.other;
			foo.method(1);

			method(2);
		`);
		expect(consoleMock).nthCalledWith(1, 'other');
		expect(consoleMock).nthCalledWith(2, '1');
		expect(consoleMock).nthCalledWith(3, 'method');
		expect(consoleMock).nthCalledWith(4, '2');
	});

  it('get on bool', () => {
		expect(() => System.run('true.foo;')).toThrowError('Only instances have properties.');
	});

  it('get on class', () => {
		expect(() => System.run(`
			class Foo {}
			Foo.bar;
		`)).toThrowError('Only instances have properties.');
	});

  it('get on function', () => {
		expect(() => System.run(`
			fun foo() {}
			foo.bar;
		`)).toThrowError('Only instances have properties.');
	});

  it('get on nil', () => {
		expect(() => System.run('nil.foo;')).toThrowError('Only instances have properties.');
	});

  it('get on num', () => {
		expect(() => System.run('123.foo;')).toThrowError('Only instances have properties.');
	});

  it('get on string', () => {
		expect(() => System.run('"str".foo;')).toThrowError('Only instances have properties.');
	});
	
  it('undefined', () => {
		expect(() => System.run(`
			class Foo {}

			var foo = Foo();
			foo.bar;
		`)).toThrowError("Undefined property 'bar'.");
	});
});