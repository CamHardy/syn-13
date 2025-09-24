import { Scanner } from './scanner.js';
import { OpCode } from './chunk.js';
/** @import { Chunk } from './chunk.js' */
/** @import { Token } from './scanner.js' */
/** @import { Value } from "./value.js" */

/**
 * @typedef { Object } Parser
 * @property { Token } current
 * @property { Token } previous
 * @property { boolean } hadError
 * @property { boolean } panicMode
 */

let parser = /** @type { Parser } */ ({});
let scanner = /** @type { Scanner } */ ({});
let compilingChunk = /** @type { Chunk } */ ({});

/** @returns { Chunk } */
function currentChunk() {
	return compilingChunk;
}

/** 
 * @param { string } source 
 * @param { Chunk } chunk
 * @returns { boolean }
 */
export function compile(source, chunk) {
	scanner = new Scanner(source);
	compilingChunk = chunk;

	parser.hadError = false;
	parser.panicMode = false;

	advance();
	expression();
	consume('TOKEN_EOF', 'Expected end of expression.');
	endCompiler();

	return !parser.hadError;
}

function advance() {
	parser.previous = parser.current;

	for (;;) {
		parser.current = scanner.scanToken();
		if (parser.current.type !== 'TOKEN_ERROR') break;

		errorAtCurrent(parser.current.lexeme);
	}
}

/** 
 * @param { string } type 
 * @param { string } message 
 */
function consume(type, message) {
	if (parser.current.type === type) {
		advance();
		return;
	}

	errorAtCurrent(message);
}

function endCompiler() {
	emitReturn();
}

function number() {
	let value = parseFloat(parser.previous.lexeme);
	emitConstant(value);
}

function expression() {}

/** @param { number } byte */
function emitByte(byte) {
	currentChunk().write(byte, parser.previous.line);
}

/** 
 * @param { number } byte1 
 * @param { number } byte2 
 */
function emitBytes(byte1, byte2) {
	emitByte(byte1);
	emitByte(byte2);
}

function emitReturn() {
	emitByte(OpCode.OP_RETURN);
}

/** @param { Value } value */
function makeConstant(value) {
	let constant = currentChunk().addConstant(value);
	if (constant > 255) {
		errorAtCurrent('Too many constants in one chunk.');
		return 0;
	}

	return constant;
}

/** @param { Value } value */
function emitConstant(value) {
	emitBytes(OpCode.OP_CONSTANT, makeConstant(value));
}

/** @param { string } message */
function errorAtCurrent(message) {
	errorAt(parser.current, message);
}

/** @param { string } message */
function error(message) {
	errorAt(parser.previous, message);
}

/** 
 * @param { Token } token 
 * @param { string } message 
 */
function errorAt(token, message) {
	if (parser.panicMode) return;
	parser.panicMode = true;
	let line = `[line ${token.line}] Error`;

	if (token.type === 'TOKEN_EOF') {
		line += ' at end';
	} else if (token.type === 'TOKEN_ERROR') {
		// Nothing
	} else {
		line += ` at '${token.lexeme}'`;
	}

	line += `: ${message}`;
	console.error(line);
	parser.hadError = true;
}