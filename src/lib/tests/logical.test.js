import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Logical Operators', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('and', () => {
		System.run(`
			print false and 1;
			print true and 1;
			print 1 and 2 and false;
			print 1 and true;
			print 1 and 2 and 3;
			
			var a = "before";
			var b = "before";
			(a = true) and (b = false) and (a = "bad");
			print a;
			print b;
		`);
		expect(consoleMock).nthCalledWith(1, 'false');
		expect(consoleMock).nthCalledWith(2, '1');
		expect(consoleMock).nthCalledWith(3, 'false');
		expect(consoleMock).nthCalledWith(4, 'true');
		expect(consoleMock).nthCalledWith(5, '3');
		expect(consoleMock).nthCalledWith(6, 'true');
		expect(consoleMock).nthCalledWith(7, 'false');
	});

  it('and truth', () => {
		System.run(`
			print false and "bad";
			print nil and "bad";
			print true and "ok";
			print 0 and "ok";
			print "" and "ok";
		`);
		expect(consoleMock).nthCalledWith(1, 'false');
		expect(consoleMock).nthCalledWith(2, 'nil');
		expect(consoleMock).nthCalledWith(3, 'ok');
		expect(consoleMock).nthCalledWith(4, 'ok');
		expect(consoleMock).nthCalledWith(5, 'ok');
	});

  it('or', () => {
		System.run(`
			print 1 or true;
			print false or 1;
			print false or false or true;
			print false or false;
			print false or false or false;

			var a = "before";
			var b = "before";
			(a = false) or (b = true) or (a = "bad");
			print a;
			print b;
		`);
		expect(consoleMock).nthCalledWith(1, '1');
		expect(consoleMock).nthCalledWith(2, '1');
		expect(consoleMock).nthCalledWith(3, 'true');
		expect(consoleMock).nthCalledWith(4, 'false');
		expect(consoleMock).nthCalledWith(5, 'false');
		expect(consoleMock).nthCalledWith(6, 'false');
		expect(consoleMock).nthCalledWith(7, 'true');
	});

  it('or truth', () => {
		System.run(`
			print false or "ok";
			print nil or "ok";
			print true or "ok";
			print 0 or "ok";
			print "s" or "ok";
		`);
		expect(consoleMock).nthCalledWith(1, 'ok');
		expect(consoleMock).nthCalledWith(2, 'ok');
		expect(consoleMock).nthCalledWith(3, 'true');
		expect(consoleMock).nthCalledWith(4, '0');
		expect(consoleMock).nthCalledWith(5, 's');
	});
});