import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Miscellaneous', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('empty file', () => {
		System.run('');
		expect(consoleMock).toBeCalledTimes(0);
	});

  it('precedence', () => {
		System.run(`
			print 2 + 3 * 4;
			print 20 - 3 * 4;
			print 2 + 6 / 3;
			print 2 - 6 / 3;
			print false == 2 < 1;
			print false == 1 > 2;
			print false == 2 <= 1;
			print false == 1 >= 2;
			print 1 - 1;
			print 1 -1;
			print 1- 1;
			print 1-1;
			print (2 * (6 - (2 + 2)));
		`);

		expect(consoleMock).nthCalledWith(1, '14');
		expect(consoleMock).nthCalledWith(2, '8');
		expect(consoleMock).nthCalledWith(3, '4');
		expect(consoleMock).nthCalledWith(4, '0');
		expect(consoleMock).nthCalledWith(5, 'true');
		expect(consoleMock).nthCalledWith(6, 'true');
		expect(consoleMock).nthCalledWith(7, 'true');
		expect(consoleMock).nthCalledWith(8, 'true');
		expect(consoleMock).nthCalledWith(9, '0');
		expect(consoleMock).nthCalledWith(10, '0');
		expect(consoleMock).nthCalledWith(11, '0');
		expect(consoleMock).nthCalledWith(12, '0');
		expect(consoleMock).nthCalledWith(13, '4');
	});

  it('unexpected character', () => {
		System.run('foo(a | b);');
		expect(consoleMock).nthCalledWith(1, expect.stringContaining('Error: Unexpected character.'));
		expect(consoleMock).nthCalledWith(2, expect.stringContaining("Error at 'b': Expected ) after arguments."));
	});
});