import { Scanner } from './scanner.js';
import { OpCode } from './chunk.js';
import { disassembleChunk } from './debug.js';
import { DEBUG_PRINT_CODE } from './common.js';
/** @import { Chunk } from './chunk.js' */
/** @import { Token, TokenType } from './scanner.js' */
/** @import { Value } from "./value.js" */

/**
 * @typedef { Object } Parser
 * @property { Token } current
 * @property { Token } previous
 * @property { boolean } hadError
 * @property { boolean } panicMode
 */

/** @enum { number } */
const Precedence = Object.freeze({
	PREC_NONE: 0,
	PREC_ASSIGNMENT: 1,
	PREC_OR: 2,
	PREC_AND: 3,
	PREC_EQUALITY: 4,
	PREC_COMPARISON: 5,
	PREC_TERM: 6,
	PREC_FACTOR: 7,
	PREC_UNARY: 8,
	PREC_CALL: 9,
	PREC_PRIMARY: 10
});

/** @typedef { (() => void) | null } ParseFn } */

/**
 * @typedef { Object } ParseRule
 * @property { ParseFn } prefix
 * @property { ParseFn } infix
 * @property { Precedence } precedence
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

	if (DEBUG_PRINT_CODE) {
		if (!parser.hadError) {
			disassembleChunk(currentChunk(), 'code');
		}
	}
}

function binary() {
	let operatorType = parser.previous.type;
	let rule = getRule(operatorType);
	parsePrecedence(rule.precedence + 1);

	switch (operatorType) {
		case 'TOKEN_PLUS': emitByte(OpCode.OP_ADD); break;
		case 'TOKEN_MINUS': emitByte(OpCode.OP_SUBTRACT); break;
		case 'TOKEN_STAR': emitByte(OpCode.OP_MULTIPLY); break;
		case 'TOKEN_SLASH': emitByte(OpCode.OP_DIVIDE); break;
		default: return; // Unreachable.
	}
}

function grouping() {
	expression();
	consume('TOKEN_RIGHT_PAREN', "Expected ')' after expression.");
}

function number() {
	let value = parseFloat(parser.previous.lexeme);
	emitConstant(value);
}

function unary() {
	let operatorType = parser.previous.type;

	// Compile the operand.
	parsePrecedence(Precedence.PREC_UNARY);

	// Emit the operator instruction.
	switch (operatorType) {
		case 'TOKEN_MINUS': emitByte(OpCode.OP_NEGATE); break;
		default: return; // Unreachable.
	}
}

/** @type { Record<TokenType, ParseRule> } */
let rules = {
	['TOKEN_LEFT_PAREN']: { prefix: grouping, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_RIGHT_PAREN']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_LEFT_BRACE']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_RIGHT_BRACE']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_COMMA']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_DOT']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_MINUS']: { prefix: unary, infix: binary, precedence: Precedence.PREC_TERM },
	['TOKEN_PLUS']: { prefix: null, infix: binary, precedence: Precedence.PREC_TERM },
	['TOKEN_SEMICOLON']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_SLASH']: { prefix: null, infix: binary, precedence: Precedence.PREC_FACTOR },
	['TOKEN_STAR']: { prefix: null, infix: binary, precedence: Precedence.PREC_FACTOR },
	['TOKEN_BANG']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_BANG_EQUAL']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_EQUAL']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_EQUAL_EQUAL']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_GREATER']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_GREATER_EQUAL']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_LESS']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_LESS_EQUAL']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_IDENTIFIER']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_STRING']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_NUMBER']: { prefix: number, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_AND']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_CLASS']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_ELSE']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_FALSE']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_FOR']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_FUN']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_IF']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_NIL']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_OR']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_PRINT']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_RETURN']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_SUPER']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_THIS']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_TRUE']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_VAR']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_WHILE']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_ERROR']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE },
	['TOKEN_EOF']: { prefix: null, infix: null, precedence: Precedence.PREC_NONE }
}

/** @param { Precedence } precedence */
function parsePrecedence(precedence) {
	advance();
	let prefixRule = getRule(parser.previous.type).prefix;
	if (prefixRule === null) {
		error("Expected expression.");
		return;
	}

	prefixRule();

	while (precedence <= getRule(parser.current.type).precedence) {
		advance();
		let infixRule = getRule(parser.previous.type).infix ?? (() => {});
		infixRule();
	}
}

/** 
 * @param { TokenType } type 
 * @returns { ParseRule }
 */
function getRule(type) {
	return rules[type];
}

function expression() {
	parsePrecedence(Precedence.PREC_ASSIGNMENT);
}

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