import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../tree-walker/system.js';

describe('Nil', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('literal', () => {
		System.run('print nil;');
		expect(consoleMock).lastCalledWith('nil');
	});
});