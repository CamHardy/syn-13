import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Constructors', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('arguments', () => {
		System.run(`
			class Foo {
				init(a, b) {
					print "init";
					this.a = a;
					this.b = b;
				}
			}

			var foo = Foo(1, 2);
			print foo.a;
			print foo.b;
		`);
		expect(consoleMock).nthCalledWith(1, 'init');
		expect(consoleMock).nthCalledWith(2, '1');
		expect(consoleMock).nthCalledWith(3, '2');
	});

  it('call init early return', () => {
		System.run(`
			class Foo {
				init() {
					print "init";
					return;
					print "nope";
				}
			}

			var foo = Foo();
			print foo.init();
		`);
		expect(consoleMock).nthCalledWith(1, 'init');
		expect(consoleMock).nthCalledWith(2, 'init');
		expect(consoleMock).nthCalledWith(3, 'Foo instance');
	});

  it('call init explicitly', () => {
		System.run(`
			class Foo {
				init(arg) {
					print "Foo.init(" + arg + ")";
					this.field = "init";
				}
			}

			var foo = Foo("one");
			foo.field = "field";

			var foo2 = foo.init("two");
			print foo2;

			print foo.field;
		`);
		expect(consoleMock).nthCalledWith(1, 'Foo.init(one)');
		expect(consoleMock).nthCalledWith(2, 'Foo.init(two)');
		expect(consoleMock).nthCalledWith(3, 'Foo instance');
		expect(consoleMock).nthCalledWith(4, 'init');
	});

  it('default', () => {
		System.run(`
			class Foo {}

			var foo = Foo();
			print foo;
		`);
		expect(consoleMock).lastCalledWith('Foo instance');
	});

  it('default arguments', () => {
		expect(() => System.run(`
			class Foo {}

			var foo = Foo(1, 2, 3);
		`)).toThrowError('Expected 0 arguments but got 3.');
	});
});