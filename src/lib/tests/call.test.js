import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Calls', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

	it('bool', () => {
		expect(() => System.run('true();')).toThrowError('Can only call functions and classes.');
	});

	it('nil', () => {
		expect(() => System.run('nil();')).toThrowError('Can only call functions and classes.');
	});

	it('number', () => {
		expect(() => System.run('123();')).toThrowError('Can only call functions and classes.');
	});

	it('object', () => {
		expect(() => System.run(`
			class Foo {}

			var foo = Foo();
			foo();
		`)).toThrowError('Can only call functions and classes.')
	});

	it('string', () => {
		expect(() => System.run('"str"();')).toThrowError('Can only call functions and classes.');
	});
});