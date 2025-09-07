import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Return', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('after else', () => {
		System.run(`
			fun f() {
				if (false) "no"; else return "ok";
			}
			
			print f();
		`);
		expect(consoleMock).lastCalledWith('ok');
	});

  it('after if', () => {
		System.run(`
			fun f() {
				if (true) return "ok";
			}
				
			print f();
		`);
		expect(consoleMock).lastCalledWith('ok');
	});

  it('after while', () => {
		System.run(`
			fun f() {
				while (true) return "ok";
			}
				
			print f();
		`);
		expect(consoleMock).lastCalledWith('ok');
	});
});