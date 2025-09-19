import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../tree-walker/system.js';

describe('Strings', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

	it('error after multiline', () => {
		expect(() => System.run(`
			var a = "1
			2
			3
			";

			err;
		`)).toThrowError("Undefined variable 'err'.");
	});

	it('literals', () => {
		System.run(`
			print "(" + "" + ")";
			print "a string";
			print "A~¶Þॐஃ";
		`);
		expect(consoleMock).nthCalledWith(1, "()");
		expect(consoleMock).nthCalledWith(2, "a string");
		expect(consoleMock).nthCalledWith(3, "A~¶Þॐஃ");
	});

	it('multi-line', () => {
		System.run(`
			var a = "1
2
3";
			print a;
		`);
		expect(consoleMock).lastCalledWith("1\n2\n3");
	});

	it('unterminated', () => {
		System.run('"this string has no close quote');
		expect(consoleMock).lastCalledWith(expect.stringContaining('Error: Unterminated string.'));
	});
});