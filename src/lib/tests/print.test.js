import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Print', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('missing argument', () => {
		System.run('print;');
		expect(consoleMock).lastCalledWith(expect.stringContaining("Error at ';': Expected expression."));
	});
});