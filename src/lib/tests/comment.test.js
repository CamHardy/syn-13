import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../tree-walker/system.js';

describe('Comments', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('line at eof', () => {
		System.run(`
			print "ok";
			// comment
		`);
		expect(consoleMock).lastCalledWith('ok');
	});

  it('only line comment', () => {
		System.run('// comment');
		expect(consoleMock).toBeCalledTimes(0);
	});

  it('unicode', () => {
		System.run(`
			// Unicode characters are allowed in comments.
			//
			// Latin 1 Supplement: £§¶ÜÞ
			// Latin Extended-A: ĐĦŋœ
			// Latin Extended-B: ƂƢƩǁ
			// Other stuff: ឃᢆ᯽₪ℜ↩⊗┺░
			// Emoji: ☃☺♣

			print "ok";
		`);
		expect(consoleMock).lastCalledWith('ok');
	});
});