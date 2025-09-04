import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Classes', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

	it('empty', () => {
		System.run(`
			class Foo {}

			print Foo;
		`);
		expect(consoleMock).lastCalledWith('Foo');
	});

	it('inherit self', () => {
		System.run('class Foo < Foo {}');
		expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'Foo': A class can't inherit from itself."));
	});

	it('inherited method', () => {
		System.run(`
			class Foo {
				inFoo() {
					print "in foo";
				}
			}

			class Bar < Foo {
				inBar() {
					print "in bar";
				}
			}

			class Baz < Bar {
				inBaz() {
					print "in baz";
				}
			}

			var baz = Baz();
			baz.inFoo();
			baz.inBar();
			baz.inBaz();
		`);
		expect(consoleMock).nthCalledWith(1, "in foo");
		expect(consoleMock).nthCalledWith(2, "in bar");
		expect(consoleMock).nthCalledWith(3, "in baz");
	});

	it('local inherit other', () => {
		System.run(`
			class A {}

			fun f() {
				class B < A {}
				return B;
			}

			print f();
		`);
		expect(consoleMock).lastCalledWith('B');
	});

	it('local inherit self', () => {
		System.run(`
			{
				class Foo < Foo {}
			}
		`);
		expect(consoleMock).nthCalledWith(1, expect.stringContaining("Error at 'Foo': A class can't inherit from itself."));
	});

	it('local reference', () => {
		System.run(`
			{
				class Foo {
					returnSelf() {
						return Foo;
					}
				}

				print Foo().returnSelf();
			}
		`);
		expect(consoleMock).lastCalledWith('Foo');
	});

	it('reference self', () => {
		System.run(`
			class Foo {
				returnSelf() {
					return Foo;
				}
			}

			print Foo().returnSelf();
		`);
		expect(consoleMock).lastCalledWith('Foo');
	});
});