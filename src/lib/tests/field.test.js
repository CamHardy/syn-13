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
	
  it('undefined', () => {
		expect(() => System.run(`
			class Foo {}

			var foo = Foo();
			foo.bar;
		`)).toThrowError("Undefined property 'bar'.");
	});
});