import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../tree-walker/system.js';

describe('Scanning', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('identifiers', () => {
		for (const token of System.scan(`
			andy formless fo _ _123 _abc abc123
			abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_
		`)) console.log(token.toString());
		expect(consoleMock).nthCalledWith(1, 'IDENTIFIER andy null');
		expect(consoleMock).nthCalledWith(2, 'IDENTIFIER formless null');
		expect(consoleMock).nthCalledWith(3, 'IDENTIFIER fo null');
		expect(consoleMock).nthCalledWith(4, 'IDENTIFIER _ null');
		expect(consoleMock).nthCalledWith(5, 'IDENTIFIER _123 null');
		expect(consoleMock).nthCalledWith(6, 'IDENTIFIER _abc null');
		expect(consoleMock).nthCalledWith(7, 'IDENTIFIER abc123 null');
		expect(consoleMock).nthCalledWith(8, 'IDENTIFIER abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_ null');
		expect(consoleMock).nthCalledWith(9, 'EOF  null');
	});

  it('keywords', () => {
		for (const token of System.scan(`
			and class else false for fun if nil or print return super this true var while
		`)) console.log(token.toString());
		expect(consoleMock).nthCalledWith(1, 'AND and null');
		expect(consoleMock).nthCalledWith(2, 'CLASS class null');
		expect(consoleMock).nthCalledWith(3, 'ELSE else null');
		expect(consoleMock).nthCalledWith(4, 'FALSE false null');
		expect(consoleMock).nthCalledWith(5, 'FOR for null');
		expect(consoleMock).nthCalledWith(6, 'FUN fun null');
		expect(consoleMock).nthCalledWith(7, 'IF if null');
		expect(consoleMock).nthCalledWith(8, 'NIL nil null');
		expect(consoleMock).nthCalledWith(9, 'OR or null');
		expect(consoleMock).nthCalledWith(10, 'PRINT print null');
		expect(consoleMock).nthCalledWith(11, 'RETURN return null');
		expect(consoleMock).nthCalledWith(12, 'SUPER super null');
		expect(consoleMock).nthCalledWith(13, 'THIS this null');
		expect(consoleMock).nthCalledWith(14, 'TRUE true null');
		expect(consoleMock).nthCalledWith(15, 'VAR var null');
		expect(consoleMock).nthCalledWith(16, 'WHILE while null');
		expect(consoleMock).nthCalledWith(17, 'EOF  null');
	});

  it('numbers', () => {
		for (const token of System.scan(`
			123 
			123.456 
			.456 
			123.
		`)) console.log(token.toString());
		expect(consoleMock).nthCalledWith(1, 'NUMBER 123 123');
		expect(consoleMock).nthCalledWith(2, 'NUMBER 123.456 123.456');
		expect(consoleMock).nthCalledWith(3, 'DOT . null');
		expect(consoleMock).nthCalledWith(4, 'NUMBER 456 456');
		expect(consoleMock).nthCalledWith(5, 'NUMBER 123 123');
		expect(consoleMock).nthCalledWith(6, 'DOT . null');
		expect(consoleMock).nthCalledWith(7, 'EOF  null');
	});

  it('punctuators', () => {
		for (const token of System.scan(`
			(){};,+-*!===<=>==!<>/.
		`)) console.log(token.toString());
		expect(consoleMock).nthCalledWith(1, 'LEFT_PAREN ( null');
		expect(consoleMock).nthCalledWith(2, 'RIGHT_PAREN ) null');
		expect(consoleMock).nthCalledWith(3, 'LEFT_BRACE { null');
		expect(consoleMock).nthCalledWith(4, 'RIGHT_BRACE } null');
		expect(consoleMock).nthCalledWith(5, 'SEMICOLON ; null');
		expect(consoleMock).nthCalledWith(6, 'COMMA , null');
		expect(consoleMock).nthCalledWith(7, 'PLUS + null');
		expect(consoleMock).nthCalledWith(8, 'MINUS - null');
		expect(consoleMock).nthCalledWith(9, 'STAR * null');
		expect(consoleMock).nthCalledWith(10, 'BANG_EQUAL != null');
		expect(consoleMock).nthCalledWith(11, 'EQUAL_EQUAL == null');
		expect(consoleMock).nthCalledWith(12, 'LESS_EQUAL <= null');
		expect(consoleMock).nthCalledWith(13, 'GREATER_EQUAL >= null');
		expect(consoleMock).nthCalledWith(14, 'EQUAL = null');
		expect(consoleMock).nthCalledWith(15, 'BANG ! null');
		expect(consoleMock).nthCalledWith(16, 'LESS < null');
		expect(consoleMock).nthCalledWith(17, 'GREATER > null');
		expect(consoleMock).nthCalledWith(18, 'SLASH / null');
		expect(consoleMock).nthCalledWith(19, 'DOT . null');
		expect(consoleMock).nthCalledWith(20, 'EOF  null');
	});

  it('strings', () => {
		for (const token of System.scan(`
			""
			"string"
		`)) console.log(token.toString());
		expect(consoleMock).nthCalledWith(1, 'STRING "" ');
		expect(consoleMock).nthCalledWith(2, 'STRING "string" string');
		expect(consoleMock).nthCalledWith(3, 'EOF  null');
	});

  it('whitespace', () => {
		for (const token of System.scan(`
			space    tabs				newlines



			end
		`)) console.log(token.toString());
		expect(consoleMock).nthCalledWith(1, 'IDENTIFIER space null');
		expect(consoleMock).nthCalledWith(2, 'IDENTIFIER tabs null');
		expect(consoleMock).nthCalledWith(3, 'IDENTIFIER newlines null');
		expect(consoleMock).nthCalledWith(4, 'IDENTIFIER end null');
		expect(consoleMock).nthCalledWith(5, 'EOF  null');
	});
});