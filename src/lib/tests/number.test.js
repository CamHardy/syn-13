import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Numbers', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('decimal point at eof', () => {
		System.run('123.');
		expect(consoleMock).lastCalledWith(expect.stringContaining("Error at end: Expected property name after ."));
	});

  it('leading dot', () => {
		System.run('.123');
		expect(consoleMock).lastCalledWith(expect.stringContaining("Error at '.': Expected expression."));
	});

  it('literals', () => {
		System.run(`
			print 123;
			print 987654;
			print 0;
			print 0.0;
			print -0;
			print 123.456;
			print -0.001;
		`);
		expect(consoleMock).nthCalledWith(1, '123');
		expect(consoleMock).nthCalledWith(2, '987654');
		expect(consoleMock).nthCalledWith(3, '0');
		expect(consoleMock).nthCalledWith(4, '0');
		expect(consoleMock).nthCalledWith(5, '0');
		expect(consoleMock).nthCalledWith(6, '123.456');
		expect(consoleMock).nthCalledWith(7, '-0.001');
	});

  it('nan equality', () => {
		System.run(`
			var nan = 0/0;
			print nan == 0;
			print nan != 1;
			print nan == nan;
			print nan != nan;
		`);
		expect(consoleMock).nthCalledWith(1, 'false');
		expect(consoleMock).nthCalledWith(2, 'true');
		expect(consoleMock).nthCalledWith(3, 'false');
		expect(consoleMock).nthCalledWith(4, 'true');
	});

  it('trailing dot', () => {
		System.run('123.;');
		expect(consoleMock).lastCalledWith(expect.stringContaining("Error at ';': Expected property name after ."));
	});
});