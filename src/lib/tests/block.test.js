import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Blocks', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

	it('empty', () => {
		System.run(`
			{}
			if (true) {}
			if (false) {} else {}

			print "ok";
		`);
		expect(consoleMock).lastCalledWith('ok');
	});

	it('scope', () => {
		System.run(`
			var a = "outer";

			{
				var a = "inner";
				print a;
			}

			print a;
		`);
		expect(consoleMock).nthCalledWith(1, 'inner');
		expect(consoleMock).nthCalledWith(2, 'outer');
	});
});