import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../tree-walker/system.js';
import { AstPrinter } from '../tree-walker/astPrinter.js';
/** @import { Expression } from '../tree-walker/statement.js' */

describe('Expressions', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('evaluate', () => {
		System.run('print (5 - (3 - 1)) + -1;');
		expect(consoleMock).lastCalledWith('2');
	});

  it('parse', () => {
		const statements = System.parse('(5 - (3 - 1)) + -1;');
		AstPrinter.print(/** @type { Expression } */ (statements[0]).expression);
		expect(consoleMock).lastCalledWith('(+ (group (- 5 (group (- 3 1)))) (- 1))');
	});
});