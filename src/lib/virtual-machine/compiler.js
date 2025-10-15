import { Scanner } from './scanner.js';
import { OpCode } from './chunk.js';
import { disassembleChunk } from './debug.js';
import { DEBUG_PRINT_CODE } from './common.js';
import { NUMBER_VAL, OBJ_VAL } from './value.js';
import { copyString } from './object.js';
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

/** @typedef { ((canAssign: boolean) => void) | null } ParseFn } */

/**
 * @typedef { Object } ParseRule
 * @property { ParseFn } prefix
 * @property { ParseFn } infix
 * @property { Precedence } precedence
 */

/**
 * @typedef { Object } Local
 * @property { string } name
 * @property { number } depth
 */

/** 
 * @typedef { Object } Compiler
 * @property { Local[] } locals
 * @property { number } localCount
 * @property { number } scopeDepth
 */

let parser = /** @type { Parser } */ ({});
let current = /** @type { Compiler } */ ({});
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
	let compiler = /** @type { Compiler } */ ({});
	initCompiler(compiler);
	compilingChunk = chunk;

	parser.hadError = false;
	parser.panicMode = false;

	advance();
	
	while (!match('TOKEN_EOF')) {
		declaration();
	}

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

/** 
 * @param { TokenType } type 
 * @returns { boolean } 
 */
function check(type) {
	return parser.current.type === type;
}

/** 
 * @param { TokenType } type 
 * @returns { boolean } 
 */
function match(type) {
	if (!check(type)) return false;
	advance();
	return true;
}

function endCompiler() {
	emitReturn();

	if (DEBUG_PRINT_CODE) {
		if (!parser.hadError) {
			disassembleChunk(currentChunk(), 'code');
		}
	}
}

function beginScope() {
	current.scopeDepth++;
}

function endScope() {
	current.scopeDepth--;
}

/** @param { boolean } canAssign */
function binary(canAssign) {
	let operatorType = parser.previous.type;
	let rule = getRule(operatorType);
	parsePrecedence(rule.precedence + 1);

	switch (operatorType) {
		case 'TOKEN_BANG_EQUAL': emitBytes(OpCode.OP_EQUAL, OpCode.OP_NOT); break;
		case 'TOKEN_EQUAL_EQUAL': emitByte(OpCode.OP_EQUAL); break;
		case 'TOKEN_GREATER': emitByte(OpCode.OP_GREATER); break;
		case 'TOKEN_GREATER_EQUAL': emitBytes(OpCode.OP_LESS, OpCode.OP_NOT); break;
		case 'TOKEN_LESS': emitByte(OpCode.OP_LESS); break;
		case 'TOKEN_LESS_EQUAL': emitBytes(OpCode.OP_GREATER, OpCode.OP_NOT); break;
		case 'TOKEN_PLUS': emitByte(OpCode.OP_ADD); break;
		case 'TOKEN_MINUS': emitByte(OpCode.OP_SUBTRACT); break;
		case 'TOKEN_STAR': emitByte(OpCode.OP_MULTIPLY); break;
		case 'TOKEN_SLASH': emitByte(OpCode.OP_DIVIDE); break;
		default: return; // Unreachable.
	}
}

/** @param { boolean } canAssign */
function literal(canAssign) {
	switch (parser.previous.type) {
		case 'TOKEN_FALSE': emitByte(OpCode.OP_FALSE); break;
		case 'TOKEN_NIL': emitByte(OpCode.OP_NIL); break;
		case 'TOKEN_TRUE': emitByte(OpCode.OP_TRUE); break;
		default: return; // Unreachable.
	}
}

/** @param { boolean } canAssign */
function grouping(canAssign) {
	expression();
	consume('TOKEN_RIGHT_PAREN', "Expected ')' after expression.");
}

/** @param { boolean } canAssign */
function number(canAssign) {
	let value = parseFloat(parser.previous.lexeme);
	emitConstant(NUMBER_VAL(value));
}

/** @param { boolean } canAssign */
function string(canAssign) {
	emitConstant(OBJ_VAL(copyString(parser.previous.lexeme.slice(1, -1))));
}

/** 
 * @param { Token } name 
 * @param { boolean } canAssign
 */
function namedVariable(name, canAssign) {
	let arg = identifierConstant(name);

	if (canAssign && match('TOKEN_EQUAL')) {
		expression();
		emitBytes(OpCode.OP_SET_GLOBAL, arg);
	} else {
		emitBytes(OpCode.OP_GET_GLOBAL, arg);
	}
}

/** @param { boolean } canAssign */
function variable(canAssign) {
	namedVariable(parser.previous, canAssign);
}

/** @param { boolean } canAssign */
function unary(canAssign) {
	let operatorType = parser.previous.type;

	// Compile the operand.
	parsePrecedence(Precedence.PREC_UNARY);

	// Emit the operator instruction.
	switch (operatorType) {
		case 'TOKEN_BANG': emitByte(OpCode.OP_NOT); break;
		case 'TOKEN_MINUS': emitByte(OpCode.OP_NEGATE); break;
		default: return; // Unreachable.
	}
}

/** @type { Record<TokenType, ParseRule> } */
let rules = {
	['TOKEN_LEFT_PAREN']: 		{ prefix: grouping, infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_RIGHT_PAREN']: 		{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_LEFT_BRACE']: 		{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_RIGHT_BRACE']: 		{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_COMMA']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_DOT']: 						{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_MINUS']: 					{ prefix: unary, 		infix: binary, 	precedence: Precedence.PREC_TERM },
	['TOKEN_PLUS']: 					{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_TERM },
	['TOKEN_SEMICOLON']: 			{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_SLASH']: 					{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_FACTOR },
	['TOKEN_STAR']: 					{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_FACTOR },
	['TOKEN_BANG']: 					{ prefix: unary, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_BANG_EQUAL']: 		{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_EQUALITY },
	['TOKEN_EQUAL']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_EQUAL_EQUAL']: 		{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_EQUALITY },
	['TOKEN_GREATER']: 				{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_COMPARISON },
	['TOKEN_GREATER_EQUAL']: 	{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_COMPARISON },
	['TOKEN_LESS']: 					{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_COMPARISON },
	['TOKEN_LESS_EQUAL']: 		{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_COMPARISON },
	['TOKEN_IDENTIFIER']: 		{ prefix: variable, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_STRING']: 				{ prefix: string, 	infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_NUMBER']: 				{ prefix: number, 	infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_AND']: 						{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_CLASS']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_ELSE']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_FALSE']: 					{ prefix: literal, 	infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_FOR']: 						{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_FUN']: 						{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_IF']: 						{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_NIL']: 						{ prefix: literal, 	infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_OR']: 						{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_PRINT']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_RETURN']: 				{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_SUPER']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_THIS']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_TRUE']: 					{ prefix: literal, 	infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_VAR']: 						{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_WHILE']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_ERROR']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_EOF']: 						{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE }
}

/** @param { Precedence } precedence */
function parsePrecedence(precedence) {
	advance();
	let prefixRule = getRule(parser.previous.type).prefix;
	if (prefixRule === null) {
		error("Expected expression.");
		return;
	}

	let canAssign = precedence <= Precedence.PREC_ASSIGNMENT;
	prefixRule(canAssign);

	while (precedence <= getRule(parser.current.type).precedence) {
		advance();
		let infixRule = getRule(parser.previous.type).infix ?? (() => {});
		infixRule(canAssign);
	}

	if (canAssign && match('TOKEN_EQUAL')) {
		error("Invalid assignment target.");
	}
}

/**
 * @param { Token } name
 * @returns 
 */
function identifierConstant(name) {
	return makeConstant(OBJ_VAL(copyString(name.lexeme)));
}

/** 
 * @param { string } errorMessage 
 * @returns { number } 
 */
function parseVariable(errorMessage) {
	consume('TOKEN_IDENTIFIER', errorMessage);

	return identifierConstant(parser.previous);
}

/** @param { number } global */
function defineVariable(global) {
	emitBytes(OpCode.OP_DEFINE_GLOBAL, global);
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

function block() {
	while (!check('TOKEN_RIGHT_BRACE') && !check('TOKEN_EOF')) {
		declaration();
	}

	consume('TOKEN_RIGHT_BRACE', "Expected '}' after block.");
}

function varDeclaration() {
	let global = parseVariable('Expected variable name.');

	if (match('TOKEN_EQUAL')) {
		expression();
	} else {
		emitByte(OpCode.OP_NIL);
	}

	consume('TOKEN_SEMICOLON', "Expected ';' after variable declaration.");

	defineVariable(global);
}

function expressionStatement() {
	expression();
	consume('TOKEN_SEMICOLON', "Expected ';' after value.");
	emitByte(OpCode.OP_POP);
}

function printStatement() {
	expression();
	consume('TOKEN_SEMICOLON', "Expected ';' after value.");
	emitByte(OpCode.OP_PRINT);
}

function synchronize() {
	parser.panicMode = false;

	while (parser.current.type !== 'TOKEN_EOF') {
		if (parser.previous.type === 'TOKEN_SEMICOLON') return;

		switch (parser.current.type) {
			case 'TOKEN_CLASS':
			case 'TOKEN_FUN':
			case 'TOKEN_VAR':
			case 'TOKEN_FOR':
			case 'TOKEN_IF':
			case 'TOKEN_WHILE':
			case 'TOKEN_PRINT':
			case 'TOKEN_RETURN':
				return;
			default: ; // Do nothing.
		}

		advance();
	}
}

function declaration() {
	if (match('TOKEN_VAR')) {
		varDeclaration();
	} else {
		statement();
	}

	if (parser.panicMode) synchronize();
}

function statement() {
	if (match('TOKEN_PRINT')) {
		printStatement();
	} else if (match('TOKEN_LEFT_BRACE')) {
		beginScope();
		block();
		endScope();
	} else {
		expressionStatement();
	}
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

/** @param { Compiler } compiler */
function initCompiler(compiler) {
	compiler.localCount = 0;
	compiler.scopeDepth = 0;

	current = compiler;
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