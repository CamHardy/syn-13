import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../tree-walker/system.js';

describe('Print', () => {
  const consoleMock = vi.spyOn(console, 'log');
  const errorMock = vi.spyOn(console, 'error');

  afterEach(() => {
    consoleMock.mockClear();
		errorMock.mockClear();
  });

  it('missing argument', () => {
		System.run('print;');
		expect(errorMock).lastCalledWith(expect.stringContaining("Error at ';': Expected expression."));
	});
});