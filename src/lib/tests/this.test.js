import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../tree-walker/system.js';

describe('This', () => {
  const consoleMock = vi.spyOn(console, 'log');
	const errorMock = vi.spyOn(console, 'error');

  afterEach(() => {
    consoleMock.mockClear();
		errorMock.mockClear();
  });

	it('closure', () => {
		System.run(`
			class Foo {
				getClosure() {
					fun closure() {
						return this.toString();
					}
					return closure;
				}

				toString() { return "Foo"; }
			}

			var closure = Foo().getClosure();
			print closure();
		`);
		expect(consoleMock).lastCalledWith('Foo');
	});

	it('nested class', () => {
		System.run(`
			class Outer {
				method() {
					print this;

					fun f() {
						print this;

						class Inner {
							method() {
								print this;
							}
						}

						Inner().method();
					}
					f();
				}
			}
			Outer().method();
		`);
		expect(consoleMock).nthCalledWith(1, 'Outer instance');
		expect(consoleMock).nthCalledWith(2, 'Outer instance');
		expect(consoleMock).nthCalledWith(3, 'Inner instance');
	});

	it('nested closure', () => {
		System.run(`
			class Foo {
				getClosure() {
					fun f() {
						fun g() {
							fun h() {
								return this.toString();
							}
							return h;
						}
						return g;
					}
					return f;
				}

				toString() { return "Foo"; }
			}

			var closure = Foo().getClosure();
			print closure()()();
		`);
		expect(consoleMock).lastCalledWith('Foo');
	});

	it('this at top level', () => {
		System.run('this;');
		expect(errorMock).lastCalledWith(expect.stringContaining("Error at 'this': Can't use 'this' outside of a class."));
	});

	it('this in method', () => {
		System.run(`
			class Foo {
				bar() { return this; }
				baz() { return "baz"; }
			}

			print Foo().bar().baz();
		`);
		expect(consoleMock).lastCalledWith('baz');
	});

	it('this in top level function', () => {
		System.run(`
			fun foo() {
				this;
			}
		`);
		expect(errorMock).lastCalledWith(expect.stringContaining("Error at 'this': Can't use 'this' outside of a class."));
	});
});