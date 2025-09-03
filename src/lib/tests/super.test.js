import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Super', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

	it('bound method', () => {
		System.run(`
			class A {
				method(arg) {
					print "A.method(" + arg + ")";
				}
			}

			class B < A {
				getClosure() {
					return super.method;
				}

				method(arg) {
					print "B.method(" + arg + ")";
				}
			}

			var closure = B().getClosure();
			closure("arg");
		`);
		expect(consoleMock).lastCalledWith("A.method(arg)");
	});

	it('call other method', () => {
		System.run(`
			class Base {
				foo() {
					print "Base.foo()";
				}
			}

			class Derived < Base {
				bar() {
					print "Derived.bar()";
					super.foo();
				}
			}

			Derived().bar();
		`);
		expect(consoleMock).nthCalledWith(1, "Derived.bar()");
		expect(consoleMock).nthCalledWith(2, "Base.foo()");
	});

	it('call same method', () => {
		System.run(`
			class Base {
				foo() {
					print "Base.foo()";
				}
			}

			class Derived < Base {
				foo() {
					print "Derived.foo()";
					super.foo();
				}
			}

			Derived().foo();
		`);
		expect(consoleMock).nthCalledWith(1, "Derived.foo()");
		expect(consoleMock).nthCalledWith(2, "Base.foo()");
	});

	it('closure', () => {
		System.run(`
			class Base {
				foo() {
					print "Base.foo()";
				}
			}

			class Derived < Base {
				foo() {
					print "Derived.foo()";
					super.foo();
				}
			}

			Derived().foo();
		`);
		expect(consoleMock).nthCalledWith(1, "Derived.foo()");
		expect(consoleMock).nthCalledWith(2, "Base.foo()");
	});

	it('constructor', () => {
		System.run(`
			class Base {
				init(a, b) {
					print "Base.init(" + a + ", " + b + ")";
				}
			}

			class Derived < Base {
				init() {
					print "Derived.init()";
					super.init("a", "b");
				}
			}

			Derived();
		`);
		expect(consoleMock).nthCalledWith(1, "Derived.init()");
		expect(consoleMock).nthCalledWith(2, "Base.init(a, b)");
	});

	it('extra arguments', () => {
		expect(() => System.run(`
			class Base {
				foo(a, b) {
					print "Base.foo(" + a + ", " + b + ")";
				}
			}

			class Derived < Base {
				foo() {
					print "Derived.foo()";
					super.foo("a", "b", "c", "d");
				}
			}

			Derived().foo();
		`)).toThrowError("Expected 2 arguments but got 4.");
		expect(consoleMock).nthCalledWith(1, "Derived.foo()");
	});

	it('indirectly inherited', () => {
		System.run(`
			class A {
				foo() {
					print "A.foo()";
				}
			}

			class B < A {}

			class C < B {
				foo() {
					print "C.foo()";
					super.foo();
				}
			}

			C().foo();
		`);
		expect(consoleMock).nthCalledWith(1, "C.foo()");
		expect(consoleMock).nthCalledWith(2, "A.foo()");
	});

	it('missing arguments', () => {
		expect(() => System.run(`
			class Base {
				foo(a, b) {
					print "Base.foo(" + a + ", " + b + ")";
				}
			}

			class Derived < Base {
				foo() {
					super.foo(1);
				}
			}

			Derived().foo();
		`)).toThrowError('Expected 2 arguments but got 1.');
	});
});