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

	it('no superclass bind', () => {
		System.run(`
			class Base {
				foo() {
					super.doesNotExist;
				}
			}

			Base().foo();
		`);
		expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'super': Can't use 'super' in a class with no superclass."));
	});

	it('no superclass call', () => {
		System.run(`
			class Base {
				foo() {
					super.doesNotExist(1);
				}
			}

			Base().foo();
		`);
	});

	it('no superclass method', () => {
		expect(() => System.run(`
			class Base {}

			class Derived < Base {
				foo() {
					super.doesNotExist(1);
				}
			}

			Derived().foo();
		`)).toThrowError("Undefined property 'doesNotExist'.");
	});

	it('parenthesized', () => {
		System.run(`
			class A {
				method() {}
			}

			class B < A {
				method() {
					(super).method();
				}
			}
		`);
	});

	it('reassign superclass', () => {
		System.run(`
			class Base {
				method() {
					print "Base.method()";
				}
			}

			class Derived < Base {
				method() {
					super.method();
				}
			}

			class OtherBase {
				method() {
					print "OtherBase.method()";
				}
			}

			var derived = Derived();
			derived.method();
			Base = OtherBase;
			derived.method();
		`);
		expect(consoleMock).nthCalledWith(1, "Base.method()");
		expect(consoleMock).nthCalledWith(2, "Base.method()");
	});
});