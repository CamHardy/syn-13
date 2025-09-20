import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../tree-walker/system.js';

describe('Inheritance', () => {
  const consoleMock = vi.spyOn(console, 'log');
	const errorMock = vi.spyOn(console, 'error');

  afterEach(() => {
    consoleMock.mockClear();
		errorMock.mockClear();
  });

  it('constructor', () => {
		System.run(`
			class A {
				init(param) {
					this.field = param;
				}

				test() {
					print this.field;
				}
			}

			class B < A {}

			var b = B("value");
			b.test();
		`);
		expect(consoleMock).lastCalledWith('value');
	});

  it('inherit from function', () => {
		expect(() => System.run(`
			fun foo() {}

			class Subclass < foo {}
		`)).toThrowError('Superclass must be a class.');
	});

  it('inherit from nil', () => {
		expect(() => System.run(`
			var Nil = nil;
			class Foo < Nil {}
		`)).toThrowError('Superclass must be a class.');
	});

  it('inherit from number', () => {
		expect(() => System.run(`
			var Number = 123;
			class Foo < Number {}
		`)).toThrowError('Superclass must be a class.');
	});

  it('inherit methods', () => {
		System.run(`
			class Foo {
				methodOnFoo() { print "foo"; }
				override() { print "foo"; }
			}

			class Bar < Foo {
				methodOnBar() { print "bar"; }
				override() { print "bar"; }
			}

			var bar = Bar();
			bar.methodOnFoo();
			bar.methodOnBar();
			bar.override();
		`);
		expect(consoleMock).nthCalledWith(1, 'foo');
		expect(consoleMock).nthCalledWith(2, 'bar');
		expect(consoleMock).nthCalledWith(3, 'bar');
	});

  it('parenthesized superclass', () => {
		System.run(`
			class Foo {}

			class Bar < (Foo) {}
		`);
		expect(errorMock).lastCalledWith(expect.stringContaining("Error at '(': Expected superclass name."));
	});

  it('set fields from base', () => {
		System.run(`
			class Foo {
				foo(a, b) {
					this.field1 = a;
					this.field2 = b;
				}

				fooPrint() {
					print this.field1;
					print this.field2;
				}
			}

			class Bar < Foo {
				bar(a, b) {
					this.field1 = a;
					this.field2 = b;
				}

				barPrint() {
					print this.field1;
					print this.field2;
				}
			}

			var bar = Bar();
			bar.foo("foo 1", "foo 2");
			bar.fooPrint();

			bar.bar("bar 1", "bar 2");
			bar.barPrint();

			bar.fooPrint();
		`);
		expect(consoleMock).nthCalledWith(1, 'foo 1');
		expect(consoleMock).nthCalledWith(2, 'foo 2');
		expect(consoleMock).nthCalledWith(3, 'bar 1');
		expect(consoleMock).nthCalledWith(4, 'bar 2');
		expect(consoleMock).nthCalledWith(5, 'bar 1');
		expect(consoleMock).nthCalledWith(6, 'bar 2');
	});
});